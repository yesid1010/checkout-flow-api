import { Product } from '../../contexts/products/domain/product.entity';
import { Stock } from '../../contexts/products/domain/stock.vo';
import { DUMMY_PRODUCTS } from './dummy-products';

describe('DUMMY_PRODUCTS', () => {
  it('contains at least one product', () => {
    expect(DUMMY_PRODUCTS.length).toBeGreaterThan(0);
  });

  it('has unique ids', () => {
    const ids = DUMMY_PRODUCTS.map((product) => product.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(DUMMY_PRODUCTS)('$name satisfies the Product domain invariants', (dummy) => {
    expect(() =>
      Product.create({
        id: dummy.id,
        name: dummy.name,
        description: dummy.description,
        priceInCents: dummy.priceInCents,
        stock: Stock.create(dummy.stock),
      }),
    ).not.toThrow();
  });
});
