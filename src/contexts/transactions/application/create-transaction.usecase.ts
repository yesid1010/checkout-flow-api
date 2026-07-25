import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Customer, DocumentType } from '../../customers/domain/customer.entity';
import { CUSTOMER_REPOSITORY } from '../../customers/domain/customer.repository';
import type { CustomerRepository } from '../../customers/domain/customer.repository';
import { Email } from '../../customers/domain/email.vo';
import { Delivery } from '../../deliveries/domain/delivery.entity';
import { DELIVERY_REPOSITORY } from '../../deliveries/domain/delivery.repository';
import type { DeliveryRepository } from '../../deliveries/domain/delivery.repository';
import { PRODUCT_REPOSITORY } from '../../products/domain/product.repository';
import type { ProductRepository } from '../../products/domain/product.repository';
import { Result } from '../../../shared/domain/result';
import { BASE_FEE_IN_CENTS, DELIVERY_FEE_IN_CENTS } from '../domain/fees';
import { PAYMENT_GATEWAY } from '../domain/payment-gateway.port';
import type { ChargeResult, PaymentGatewayPort } from '../domain/payment-gateway.port';
import { Transaction, TransactionStatus } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import type { TransactionRepository } from '../domain/transaction.repository';

const POLL_MAX_ATTEMPTS = 5;
const POLL_DELAY_MS = 2000;

export interface CreateTransactionCommand {
  productId: string;
  customer: {
    fullName: string;
    email: string;
    documentType: DocumentType;
    documentNumber: string;
    phoneNumber: string;
  };
  delivery: {
    recipientName: string;
    recipientPhone: string;
    address: string;
    city: string;
    addressDetails?: string;
  };
  cardToken: string;
  installments: number;
}

export interface CreateTransactionOutcome {
  transactionId: string;
  status: TransactionStatus;
  totalInCents: number;
}

export type CreateTransactionError =
  | { type: 'PRODUCT_NOT_FOUND' }
  | { type: 'OUT_OF_STOCK' }
  | { type: 'GATEWAY_ERROR'; message: string };

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    @Inject(DELIVERY_REPOSITORY) private readonly deliveries: DeliveryRepository,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGatewayPort,
  ) {}

  async execute(
    command: CreateTransactionCommand,
  ): Promise<Result<CreateTransactionOutcome, CreateTransactionError>> {
    const product = await this.products.findById(command.productId);
    if (!product) {
      return Result.err({ type: 'PRODUCT_NOT_FOUND' });
    }

    // Reserve stock before charging: if this fails, nobody gets charged for
    // a sale we can't fulfill. If the charge later fails, restoreStock below
    // compensates.
    const stockReserved = await this.products.decreaseStock(command.productId, 1);
    if (!stockReserved) {
      return Result.err({ type: 'OUT_OF_STOCK' });
    }

    const customer = await this.resolveCustomer(command.customer);

    let transaction = Transaction.create({
      id: randomUUID(),
      productId: product.id,
      customerId: customer.id,
      productAmountInCents: product.priceInCents,
      baseFeeInCents: BASE_FEE_IN_CENTS,
      deliveryFeeInCents: DELIVERY_FEE_IN_CENTS,
    });
    await this.transactions.save(transaction);

    const delivery = Delivery.create({
      id: randomUUID(),
      transactionId: transaction.id,
      recipientName: command.delivery.recipientName,
      recipientPhone: command.delivery.recipientPhone,
      address: command.delivery.address,
      city: command.delivery.city,
      addressDetails: command.delivery.addressDetails,
    });
    await this.deliveries.save(delivery);

    const chargeResult = await this.gateway.createCharge({
      reference: transaction.id,
      amountInCents: transaction.totalInCents,
      currency: 'COP',
      customerEmail: customer.email.value,
      cardToken: command.cardToken,
      installments: command.installments,
    });

    if (chargeResult.isErr) {
      await this.releaseAfterFailure(product.id, transaction);
      return Result.err({ type: 'GATEWAY_ERROR', message: chargeResult.error.message });
    }

    const finalCharge = await this.resolveFinalStatus(chargeResult.value);

    if (finalCharge.isErr) {
      await this.releaseAfterFailure(product.id, transaction);
      return Result.err({ type: 'GATEWAY_ERROR', message: finalCharge.error.message });
    }

    const charge = finalCharge.value;

    if (charge.status === 'APPROVED') {
      transaction = transaction.approve(charge.gatewayTransactionId);
      await this.transactions.save(transaction);
      await this.deliveries.save(delivery.assign());
    } else {
      transaction = transaction.decline(charge.gatewayTransactionId);
      await this.transactions.save(transaction);
      await this.products.restoreStock(product.id, 1);
    }

    return Result.ok({
      transactionId: transaction.id,
      status: transaction.status,
      totalInCents: transaction.totalInCents,
    });
  }

  private async releaseAfterFailure(
    productId: string,
    transaction: Transaction,
  ): Promise<void> {
    await this.products.restoreStock(productId, 1);
    await this.transactions.save(transaction.markAsError());
  }

  private async resolveCustomer(
    input: CreateTransactionCommand['customer'],
  ): Promise<Customer> {
    const existing = await this.customers.findByEmail(input.email);
    if (existing) {
      return existing;
    }

    const customer = Customer.create({
      id: randomUUID(),
      fullName: input.fullName,
      email: Email.create(input.email),
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      phoneNumber: input.phoneNumber,
    });
    await this.customers.save(customer);
    return customer;
  }

  private async resolveFinalStatus(
    charge: ChargeResult,
  ): Promise<Result<ChargeResult, { message: string }>> {
    let current = charge;
    let attempts = 0;

    while (current.status === 'PENDING' && attempts < POLL_MAX_ATTEMPTS) {
      await this.delay(POLL_DELAY_MS);
      const polled = await this.gateway.getTransactionStatus(current.gatewayTransactionId);
      if (polled.isErr) {
        return Result.err({ message: polled.error.message });
      }
      current = polled.value;
      attempts += 1;
    }

    if (current.status === 'PENDING') {
      return Result.err({ message: 'Payment gateway timed out while polling status' });
    }

    return Result.ok(current);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
