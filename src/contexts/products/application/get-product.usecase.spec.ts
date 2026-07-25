import { Product } from '../domain/product.entity';
import { ProductRepository } from '../domain/product.repository';
import { Stock } from '../domain/stock.vo';
import { GetProductUseCase } from './get-product.usecase';

describe('GetProductUseCase', () => {
  const product = Product.create({
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling',
    priceInCents: 25000_00,
    stock: Stock.create(5),
  });

  const buildRepository = (found: Product | null): jest.Mocked<ProductRepository> =>
    ({
      findById: jest.fn().mockResolvedValue(found),
      findAll: jest.fn(),
      decreaseStock: jest.fn(),
      restoreStock: jest.fn(),
    }) as unknown as jest.Mocked<ProductRepository>;

  it('returns the product primitives when found', async () => {
    const useCase = new GetProductUseCase(buildRepository(product));

    const result = await useCase.execute('prod-1');

    expect(result.isOk).toBe(true);
    expect(result.value).toEqual(product.toPrimitives());
  });

  it('returns PRODUCT_NOT_FOUND when the product does not exist', async () => {
    const useCase = new GetProductUseCase(buildRepository(null));

    const result = await useCase.execute('missing');

    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ type: 'PRODUCT_NOT_FOUND' });
  });
});
