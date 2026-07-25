import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from '../../domain/delivery.entity';
import { DeliveryOrmEntity } from './delivery.orm-entity';
import { DeliveryTypeOrmRepository } from './delivery.typeorm.repository';

describe('DeliveryTypeOrmRepository', () => {
  let repository: DeliveryTypeOrmRepository;
  let ormRepository: jest.Mocked<Repository<DeliveryOrmEntity>>;

  const row: DeliveryOrmEntity = {
    id: 'del-1',
    transactionId: 'tx-1',
    recipientName: 'Jane Doe',
    recipientPhone: '+573001112233',
    address: 'Cra 7 # 45-12',
    city: 'Bogotá',
    addressDetails: 'Apto 302',
    status: DeliveryStatus.PENDING,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DeliveryTypeOrmRepository,
        {
          provide: getRepositoryToken(DeliveryOrmEntity),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get(DeliveryTypeOrmRepository);
    ormRepository = module.get(getRepositoryToken(DeliveryOrmEntity));
  });

  it('findById returns a domain Delivery when the row exists', async () => {
    ormRepository.findOneBy.mockResolvedValue(row);

    const delivery = await repository.findById('del-1');

    expect(ormRepository.findOneBy).toHaveBeenCalledWith({ id: 'del-1' });
    expect(delivery?.id).toBe('del-1');
    expect(delivery?.status).toBe(DeliveryStatus.PENDING);
  });

  it('findById returns null when the row does not exist', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    expect(await repository.findById('missing')).toBeNull();
  });

  it('findByTransactionId returns a domain Delivery when found', async () => {
    ormRepository.findOneBy.mockResolvedValue(row);

    const delivery = await repository.findByTransactionId('tx-1');

    expect(ormRepository.findOneBy).toHaveBeenCalledWith({ transactionId: 'tx-1' });
    expect(delivery?.transactionId).toBe('tx-1');
  });

  it('findByTransactionId returns null when not found', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    expect(await repository.findByTransactionId('missing')).toBeNull();
  });

  it('save persists the delivery primitives', async () => {
    const delivery = Delivery.create({
      id: 'del-1',
      transactionId: 'tx-1',
      recipientName: 'Jane Doe',
      recipientPhone: '+573001112233',
      address: 'Cra 7 # 45-12',
      city: 'Bogotá',
      addressDetails: 'Apto 302',
    });

    await repository.save(delivery);

    expect(ormRepository.save).toHaveBeenCalledWith(row);
  });
});
