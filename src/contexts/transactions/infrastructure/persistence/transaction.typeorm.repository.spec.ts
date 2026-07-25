import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../../domain/transaction.entity';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { TransactionTypeOrmRepository } from './transaction.typeorm.repository';

describe('TransactionTypeOrmRepository', () => {
  let repository: TransactionTypeOrmRepository;
  let ormRepository: jest.Mocked<Repository<TransactionOrmEntity>>;

  const baseRow: TransactionOrmEntity = {
    id: 'tx-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    productAmountInCents: 25000_00,
    baseFeeInCents: 500_00,
    deliveryFeeInCents: 1000_00,
    status: TransactionStatus.PENDING,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionTypeOrmRepository,
        {
          provide: getRepositoryToken(TransactionOrmEntity),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get(TransactionTypeOrmRepository);
    ormRepository = module.get(getRepositoryToken(TransactionOrmEntity));
  });

  it('findById returns a PENDING domain Transaction', async () => {
    ormRepository.findOneBy.mockResolvedValue(baseRow);

    const transaction = await repository.findById('tx-1');

    expect(transaction?.status).toBe(TransactionStatus.PENDING);
    expect(transaction?.totalInCents).toBe(25000_00 + 500_00 + 1000_00);
  });

  it('findById returns null when the row does not exist', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    expect(await repository.findById('missing')).toBeNull();
  });

  it('findById rehydrates an APPROVED transaction with its gateway reference', async () => {
    ormRepository.findOneBy.mockResolvedValue({
      ...baseRow,
      status: TransactionStatus.APPROVED,
      gatewayReference: 'wompi-ref-1',
    });

    const transaction = await repository.findById('tx-1');

    expect(transaction?.status).toBe(TransactionStatus.APPROVED);
    expect(transaction?.gatewayReference).toBe('wompi-ref-1');
  });

  it('findById rehydrates a DECLINED transaction with its gateway reference', async () => {
    ormRepository.findOneBy.mockResolvedValue({
      ...baseRow,
      status: TransactionStatus.DECLINED,
      gatewayReference: 'wompi-ref-2',
    });

    const transaction = await repository.findById('tx-1');

    expect(transaction?.status).toBe(TransactionStatus.DECLINED);
    expect(transaction?.gatewayReference).toBe('wompi-ref-2');
  });

  it('findById rehydrates an ERROR transaction', async () => {
    ormRepository.findOneBy.mockResolvedValue({
      ...baseRow,
      status: TransactionStatus.ERROR,
    });

    const transaction = await repository.findById('tx-1');

    expect(transaction?.status).toBe(TransactionStatus.ERROR);
  });

  it('save persists the transaction primitives', async () => {
    const transaction = Transaction.create({
      id: 'tx-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      productAmountInCents: 25000_00,
      baseFeeInCents: 500_00,
      deliveryFeeInCents: 1000_00,
    });

    await repository.save(transaction);

    expect(ormRepository.save).toHaveBeenCalledWith({
      id: 'tx-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      productAmountInCents: 25000_00,
      baseFeeInCents: 500_00,
      deliveryFeeInCents: 1000_00,
      status: TransactionStatus.PENDING,
      gatewayReference: undefined,
    });
  });
});
