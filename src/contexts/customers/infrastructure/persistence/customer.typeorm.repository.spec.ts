import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, DocumentType } from '../../domain/customer.entity';
import { Email } from '../../domain/email.vo';
import { CustomerOrmEntity } from './customer.orm-entity';
import { CustomerTypeOrmRepository } from './customer.typeorm.repository';

describe('CustomerTypeOrmRepository', () => {
  let repository: CustomerTypeOrmRepository;
  let ormRepository: jest.Mocked<Repository<CustomerOrmEntity>>;

  const row: CustomerOrmEntity = {
    id: 'cust-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    documentType: DocumentType.CC,
    documentNumber: '123456789',
    phoneNumber: '+573001112233',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CustomerTypeOrmRepository,
        {
          provide: getRepositoryToken(CustomerOrmEntity),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get(CustomerTypeOrmRepository);
    ormRepository = module.get(getRepositoryToken(CustomerOrmEntity));
  });

  it('findById returns a domain Customer when the row exists', async () => {
    ormRepository.findOneBy.mockResolvedValue(row);

    const customer = await repository.findById('cust-1');

    expect(ormRepository.findOneBy).toHaveBeenCalledWith({ id: 'cust-1' });
    expect(customer?.id).toBe('cust-1');
    expect(customer?.email.value).toBe('jane@example.com');
  });

  it('findById returns null when the row does not exist', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    expect(await repository.findById('missing')).toBeNull();
  });

  it('findByEmail normalizes the email before querying', async () => {
    ormRepository.findOneBy.mockResolvedValue(row);

    const customer = await repository.findByEmail('Jane@Example.com');

    expect(ormRepository.findOneBy).toHaveBeenCalledWith({
      email: 'jane@example.com',
    });
    expect(customer?.id).toBe('cust-1');
  });

  it('findByEmail returns null when no customer matches', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    expect(await repository.findByEmail('nobody@example.com')).toBeNull();
  });

  it('save persists the customer primitives', async () => {
    const customer = Customer.create({
      id: 'cust-1',
      fullName: 'Jane Doe',
      email: Email.create('jane@example.com'),
      documentType: DocumentType.CC,
      documentNumber: '123456789',
      phoneNumber: '+573001112233',
    });

    await repository.save(customer);

    expect(ormRepository.save).toHaveBeenCalledWith(row);
  });
});
