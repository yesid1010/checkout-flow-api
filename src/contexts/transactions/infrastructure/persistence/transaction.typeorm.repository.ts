import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../../domain/transaction.entity';
import { TransactionRepository } from '../../domain/transaction.repository';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Injectable()
export class TransactionTypeOrmRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.repository.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async save(transaction: Transaction): Promise<void> {
    const primitives = transaction.toPrimitives();
    await this.repository.save({
      id: primitives.id,
      productId: primitives.productId,
      customerId: primitives.customerId,
      productAmountInCents: primitives.productAmountInCents,
      baseFeeInCents: primitives.baseFeeInCents,
      deliveryFeeInCents: primitives.deliveryFeeInCents,
      status: primitives.status,
      gatewayReference: primitives.gatewayReference,
    });
  }

  /**
   * Rehydrates through the same state-transition methods the use cases call
   * (approve/decline/markAsError) instead of a raw constructor bypass, so a
   * row loaded from the DB can never represent a status the domain itself
   * wouldn't allow reaching.
   */
  private toDomain(row: TransactionOrmEntity): Transaction {
    const pending = Transaction.create({
      id: row.id,
      productId: row.productId,
      customerId: row.customerId,
      productAmountInCents: row.productAmountInCents,
      baseFeeInCents: row.baseFeeInCents,
      deliveryFeeInCents: row.deliveryFeeInCents,
    });

    switch (row.status) {
      case TransactionStatus.APPROVED:
        return pending.approve(row.gatewayReference as string);
      case TransactionStatus.DECLINED:
        return pending.decline(row.gatewayReference as string);
      case TransactionStatus.ERROR:
        return pending.markAsError();
      default:
        return pending;
    }
  }
}
