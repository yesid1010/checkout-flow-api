import { Customer, DocumentType } from '../../customers/domain/customer.entity';
import { CustomerRepository } from '../../customers/domain/customer.repository';
import { Email } from '../../customers/domain/email.vo';
import { DeliveryRepository } from '../../deliveries/domain/delivery.repository';
import { Product } from '../../products/domain/product.entity';
import { ProductRepository } from '../../products/domain/product.repository';
import { Stock } from '../../products/domain/stock.vo';
import { Result } from '../../../shared/domain/result';
import { ChargeResult, PaymentGatewayError, PaymentGatewayPort } from '../domain/payment-gateway.port';
import { CreateTransactionCommand, CreateTransactionUseCase } from './create-transaction.usecase';

describe('CreateTransactionUseCase', () => {
  let products: jest.Mocked<ProductRepository>;
  let customers: jest.Mocked<CustomerRepository>;
  let deliveries: jest.Mocked<DeliveryRepository>;
  let transactions: {
    findById: jest.Mock;
    save: jest.Mock;
  };
  let gateway: jest.Mocked<PaymentGatewayPort>;
  let useCase: CreateTransactionUseCase;

  const product = Product.create({
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling',
    priceInCents: 25000_00,
    imageUrl: 'https://tissiniapp.s3.us-east-2.amazonaws.com/img/products/1000x1000/534919_0.jpg',
    stock: Stock.create(5),
  });

  const existingCustomer = Customer.create({
    id: 'cust-1',
    fullName: 'Jane Doe',
    email: Email.create('jane@example.com'),
    documentType: DocumentType.CC,
    documentNumber: '123456789',
    phoneNumber: '+573001112233',
  });

  const command: CreateTransactionCommand = {
    productId: 'prod-1',
    customer: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      documentType: DocumentType.CC,
      documentNumber: '123456789',
      phoneNumber: '+573001112233',
    },
    delivery: {
      recipientName: 'Jane Doe',
      recipientPhone: '+573001112233',
      address: 'Cra 7 # 45-12',
      city: 'Bogotá',
    },
    cardToken: 'tok_stagtest_1',
    installments: 1,
  };

  beforeEach(() => {
    products = {
      findById: jest.fn().mockResolvedValue(product),
      findAll: jest.fn(),
      decreaseStock: jest.fn().mockResolvedValue(true),
      restoreStock: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ProductRepository>;

    customers = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(existingCustomer),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CustomerRepository>;

    deliveries = {
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DeliveryRepository>;

    transactions = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    gateway = {
      createCharge: jest.fn(),
      getTransactionStatus: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayPort>;

    useCase = new CreateTransactionUseCase(
      products,
      customers,
      deliveries,
      transactions as never,
      gateway,
    );

    // Skip the real polling delay in every test.
    jest.spyOn(useCase as unknown as { delay: (ms: number) => Promise<void> }, 'delay')
      .mockResolvedValue(undefined);
  });

  it('returns PRODUCT_NOT_FOUND when the product does not exist', async () => {
    products.findById.mockResolvedValue(null);

    const result = await useCase.execute(command);

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ type: 'PRODUCT_NOT_FOUND' });
    expect(products.decreaseStock).not.toHaveBeenCalled();
  });

  it('returns OUT_OF_STOCK without charging when stock reservation fails', async () => {
    products.decreaseStock.mockResolvedValue(false);

    const result = await useCase.execute(command);

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ type: 'OUT_OF_STOCK' });
    expect(gateway.createCharge).not.toHaveBeenCalled();
  });

  it('reuses an existing customer found by email', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'APPROVED',
      }),
    );

    await useCase.execute(command);

    expect(customers.findByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(customers.save).not.toHaveBeenCalled();
  });

  it('creates a new customer when none matches the email', async () => {
    customers.findByEmail.mockResolvedValue(null);
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'APPROVED',
      }),
    );

    await useCase.execute(command);

    expect(customers.save).toHaveBeenCalledTimes(1);
  });

  it('approves the transaction and assigns the delivery on an APPROVED charge', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'APPROVED',
      }),
    );

    const result = await useCase.execute(command);

    expect(result.isOk).toBe(true);
    expect(result.value.status).toBe('APPROVED');
    expect(result.value.totalInCents).toBe(25000_00 + 500_00 + 800_00);
    expect(products.restoreStock).not.toHaveBeenCalled();
    expect(deliveries.save).toHaveBeenCalledTimes(2);
  });

  it('declines the transaction and restores stock on a DECLINED charge', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'DECLINED',
      }),
    );

    const result = await useCase.execute(command);

    expect(result.isOk).toBe(true);
    expect(result.value.status).toBe('DECLINED');
    expect(products.restoreStock).toHaveBeenCalledWith('prod-1', 1);
  });

  it('restores stock and marks the transaction as ERROR when createCharge fails', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.err<ChargeResult, PaymentGatewayError>({
        type: 'NETWORK_ERROR',
        message: 'network down',
      }),
    );

    const result = await useCase.execute(command);

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ type: 'GATEWAY_ERROR', message: 'network down' });
    expect(products.restoreStock).toHaveBeenCalledWith('prod-1', 1);
    expect(transactions.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'ERROR' }),
    );
  });

  it('polls until APPROVED when the charge starts PENDING', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'PENDING',
      }),
    );
    gateway.getTransactionStatus.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'APPROVED',
      }),
    );

    const result = await useCase.execute(command);

    expect(gateway.getTransactionStatus).toHaveBeenCalledWith('wompi-1');
    expect(result.isOk).toBe(true);
    expect(result.value.status).toBe('APPROVED');
  });

  it('gives up after exhausting poll attempts and treats it as a gateway error', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'PENDING',
      }),
    );
    gateway.getTransactionStatus.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'PENDING',
      }),
    );

    const result = await useCase.execute(command);

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({
      type: 'GATEWAY_ERROR',
      message: 'Payment gateway timed out while polling status',
    });
    expect(products.restoreStock).toHaveBeenCalledWith('prod-1', 1);
  });

  it('propagates a gateway error surfaced mid-poll', async () => {
    gateway.createCharge.mockResolvedValue(
      Result.ok<ChargeResult, PaymentGatewayError>({
        gatewayTransactionId: 'wompi-1',
        status: 'PENDING',
      }),
    );
    gateway.getTransactionStatus.mockResolvedValue(
      Result.err<ChargeResult, PaymentGatewayError>({
        type: 'NETWORK_ERROR',
        message: 'timeout',
      }),
    );

    const result = await useCase.execute(command);

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ type: 'GATEWAY_ERROR', message: 'timeout' });
  });
});
