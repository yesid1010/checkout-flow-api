import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../shared/domain/result';
import { TransactionPrimitives } from '../domain/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import type { TransactionRepository } from '../domain/transaction.repository';

export interface GetTransactionError {
  type: 'TRANSACTION_NOT_FOUND';
}

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactions: TransactionRepository,
  ) {}

  async execute(id: string): Promise<Result<TransactionPrimitives, GetTransactionError>> {
    const transaction = await this.transactions.findById(id);
    if (!transaction) {
      return Result.err({ type: 'TRANSACTION_NOT_FOUND' });
    }
    return Result.ok(transaction.toPrimitives());
  }
}
