import { Product } from './product.entity';
import { Stock } from './stock.vo';

const buildProps = (overrides: Partial<Parameters<typeof Product.create>[0]> = {}) => ({
  id: 'prod-1',
  name: 'Wireless Headphones',
  description: 'Noise-cancelling over-ear headphones',
  priceInCents: 25000_00,
  stock: Stock.create(10),
  ...overrides,
});

describe('Product', () => {
  it('creates a valid product and exposes its properties', () => {
    const product = Product.create(buildProps());

    expect(product.id).toBe('prod-1');
    expect(product.name).toBe('Wireless Headphones');
    expect(product.description).toBe('Noise-cancelling over-ear headphones');
    expect(product.priceInCents).toBe(25000_00);
    expect(product.stock.value).toBe(10);
  });

  it('rejects an empty name', () => {
    expect(() => Product.create(buildProps({ name: '   ' }))).toThrow(
      'Product name cannot be empty',
    );
  });

  it('rejects a non-positive price', () => {
    expect(() => Product.create(buildProps({ priceInCents: 0 }))).toThrow(
      'Product price must be a positive integer amount of cents',
    );
  });

  it('rejects a non-integer price', () => {
    expect(() => Product.create(buildProps({ priceInCents: 10.5 }))).toThrow(
      'Product price must be a positive integer amount of cents',
    );
  });

  it('reports available stock correctly', () => {
    const product = Product.create(buildProps({ stock: Stock.create(3) }));

    expect(product.hasAvailableStock(3)).toBe(true);
    expect(product.hasAvailableStock(4)).toBe(false);
  });

  it('serializes to primitives', () => {
    const product = Product.create(buildProps());

    expect(product.toPrimitives()).toEqual({
      id: 'prod-1',
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones',
      priceInCents: 25000_00,
      stock: 10,
    });
  });
});
