import { Transaction, TransactionStatus } from './transaction.entity';

const buildProps = (overrides: Partial<Parameters<typeof Transaction.create>[0]> = {}) => ({
  id: 'tx-1',
  productId: 'prod-1',
  customerId: 'cust-1',
  productAmountInCents: 25000_00,
  baseFeeInCents: 500_00,
  deliveryFeeInCents: 1000_00,
  ...overrides,
});

describe('Transaction', () => {
  it('creates a PENDING transaction and exposes its properties', () => {
    const transaction = Transaction.create(buildProps());

    expect(transaction.id).toBe('tx-1');
    expect(transaction.productId).toBe('prod-1');
    expect(transaction.customerId).toBe('cust-1');
    expect(transaction.productAmountInCents).toBe(25000_00);
    expect(transaction.baseFeeInCents).toBe(500_00);
    expect(transaction.deliveryFeeInCents).toBe(1000_00);
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.gatewayReference).toBeUndefined();
    expect(transaction.isFinal).toBe(false);
  });

  it('rejects a non-positive product amount', () => {
    expect(() => Transaction.create(buildProps({ productAmountInCents: 0 }))).toThrow(
      'Product amount must be a positive integer amount of cents',
    );
  });

  it('rejects a negative base fee', () => {
    expect(() => Transaction.create(buildProps({ baseFeeInCents: -1 }))).toThrow(
      'Base fee must be a non-negative integer amount of cents',
    );
  });

  it('rejects a negative delivery fee', () => {
    expect(() => Transaction.create(buildProps({ deliveryFeeInCents: -1 }))).toThrow(
      'Delivery fee must be a non-negative integer amount of cents',
    );
  });

  it('computes the total as the sum of product amount, base fee and delivery fee', () => {
    const transaction = Transaction.create(buildProps());

    expect(transaction.totalInCents).toBe(25000_00 + 500_00 + 1000_00);
  });

  it('approve() transitions PENDING to APPROVED with a gateway reference', () => {
    const transaction = Transaction.create(buildProps());
    const approved = transaction.approve('wompi-ref-1');

    expect(approved.status).toBe(TransactionStatus.APPROVED);
    expect(approved.gatewayReference).toBe('wompi-ref-1');
    expect(approved.isFinal).toBe(true);
    expect(transaction.status).toBe(TransactionStatus.PENDING);
  });

  it('decline() transitions PENDING to DECLINED with a gateway reference', () => {
    const transaction = Transaction.create(buildProps());
    const declined = transaction.decline('wompi-ref-2');

    expect(declined.status).toBe(TransactionStatus.DECLINED);
    expect(declined.gatewayReference).toBe('wompi-ref-2');
    expect(declined.isFinal).toBe(true);
  });

  it('markAsError() transitions PENDING to ERROR', () => {
    const transaction = Transaction.create(buildProps());
    const errored = transaction.markAsError();

    expect(errored.status).toBe(TransactionStatus.ERROR);
    expect(errored.isFinal).toBe(true);
  });

  it('rejects approving a transaction that is not PENDING', () => {
    const approved = Transaction.create(buildProps()).approve('ref');

    expect(() => approved.approve('ref-2')).toThrow('Transaction tx-1 is already APPROVED');
  });

  it('rejects declining a transaction that is not PENDING', () => {
    const declined = Transaction.create(buildProps()).decline('ref');

    expect(() => declined.decline('ref-2')).toThrow('Transaction tx-1 is already DECLINED');
  });

  it('rejects marking as error a transaction that is not PENDING', () => {
    const errored = Transaction.create(buildProps()).markAsError();

    expect(() => errored.markAsError()).toThrow('Transaction tx-1 is already ERROR');
  });

  it('serializes to primitives including the computed total', () => {
    const transaction = Transaction.create(buildProps()).approve('wompi-ref-1');

    expect(transaction.toPrimitives()).toEqual({
      id: 'tx-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      productAmountInCents: 25000_00,
      baseFeeInCents: 500_00,
      deliveryFeeInCents: 1000_00,
      status: TransactionStatus.APPROVED,
      gatewayReference: 'wompi-ref-1',
      totalInCents: 25000_00 + 500_00 + 1000_00,
    });
  });
});
