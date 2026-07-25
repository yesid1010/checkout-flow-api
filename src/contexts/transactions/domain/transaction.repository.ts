import { Transaction } from './transaction.entity';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
}
