import { Transaction } from '../domain/transaction.entity';
import { TransactionRepository } from '../domain/transaction.repository';
import { GetTransactionUseCase } from './get-transaction.usecase';

describe('GetTransactionUseCase', () => {
  const transaction = Transaction.create({
    id: 'tx-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    productAmountInCents: 25000_00,
    baseFeeInCents: 500_00,
    deliveryFeeInCents: 800_00,
  });

  it('returns the transaction primitives when found', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(transaction),
    } as unknown as TransactionRepository;

    const result = await new GetTransactionUseCase(repository).execute('tx-1');

    expect(result.isOk).toBe(true);
    expect(result.value).toEqual(transaction.toPrimitives());
  });

  it('returns TRANSACTION_NOT_FOUND when missing', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as TransactionRepository;

    const result = await new GetTransactionUseCase(repository).execute('missing');

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ type: 'TRANSACTION_NOT_FOUND' });
  });
});
