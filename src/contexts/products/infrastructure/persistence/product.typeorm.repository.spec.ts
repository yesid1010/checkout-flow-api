import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';
import { ProductTypeOrmRepository } from './product.typeorm.repository';

describe('ProductTypeOrmRepository', () => {
  let repository: ProductTypeOrmRepository;
  let ormRepository: jest.Mocked<Repository<ProductOrmEntity>>;
  let queryBuilder: {
    update: jest.Mock;
    set: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    setParameter: jest.Mock;
    execute: jest.Mock;
  };

  const row: ProductOrmEntity = {
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling',
    priceInCents: 25000_00,
    stock: 5,
  };

  beforeEach(async () => {
    queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ProductTypeOrmRepository,
        {
          provide: getRepositoryToken(ProductOrmEntity),
          useValue: {
            findOneBy: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get(ProductTypeOrmRepository);
    ormRepository = module.get(getRepositoryToken(ProductOrmEntity));
  });

  it('findById returns a domain Product when the row exists', async () => {
    ormRepository.findOneBy.mockResolvedValue(row);

    const product = await repository.findById('prod-1');

    expect(ormRepository.findOneBy).toHaveBeenCalledWith({ id: 'prod-1' });
    expect(product?.id).toBe('prod-1');
    expect(product?.stock.value).toBe(5);
  });

  it('findById returns null when the row does not exist', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    const product = await repository.findById('missing');

    expect(product).toBeNull();
  });

  it('findAll maps every row to a domain Product', async () => {
    ormRepository.find.mockResolvedValue([row]);

    const products = await repository.findAll();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('prod-1');
  });

  it('decreaseStock returns true when the atomic update affects a row', async () => {
    queryBuilder.execute.mockResolvedValue({ affected: 1 });

    const result = await repository.decreaseStock('prod-1', 2);

    expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', { id: 'prod-1' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('stock >= :quantity', {
      quantity: 2,
    });
    expect(result).toBe(true);
  });

  it('decreaseStock returns false when no row had enough stock', async () => {
    queryBuilder.execute.mockResolvedValue({ affected: 0 });

    const result = await repository.decreaseStock('prod-1', 99);

    expect(result).toBe(false);
  });

  it('decreaseStock returns false when affected is undefined', async () => {
    queryBuilder.execute.mockResolvedValue({});

    const result = await repository.decreaseStock('prod-1', 1);

    expect(result).toBe(false);
  });

  it('restoreStock issues an atomic increase for the given id and quantity', async () => {
    queryBuilder.execute.mockResolvedValue({ affected: 1 });

    await repository.restoreStock('prod-1', 2);

    expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', { id: 'prod-1' });
    expect(queryBuilder.setParameter).toHaveBeenCalledWith('quantity', 2);
  });
});
