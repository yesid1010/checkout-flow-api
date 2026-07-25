import { Product } from '../domain/product.entity';
import { ProductRepository } from '../domain/product.repository';
import { Stock } from '../domain/stock.vo';
import { ListProductsUseCase } from './list-products.usecase';

describe('ListProductsUseCase', () => {
  it('maps every repository product to primitives', async () => {
    const products = [
      Product.create({
        id: 'prod-1',
        name: 'Wireless Headphones',
        description: 'Noise-cancelling',
        priceInCents: 25000_00,
        stock: Stock.create(5),
      }),
    ];
    const repository = {
      findAll: jest.fn().mockResolvedValue(products),
    } as unknown as ProductRepository;

    const result = await new ListProductsUseCase(repository).execute();

    expect(result).toEqual([products[0].toPrimitives()]);
  });

  it('returns an empty array when there are no products', async () => {
    const repository = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as ProductRepository;

    const result = await new ListProductsUseCase(repository).execute();

    expect(result).toEqual([]);
  });
});
