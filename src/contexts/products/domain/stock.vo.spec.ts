import { Stock } from './stock.vo';

describe('Stock', () => {
  it('creates a valid stock with a non-negative integer quantity', () => {
    expect(Stock.create(10).value).toBe(10);
    expect(Stock.create(0).value).toBe(0);
  });

  it('rejects negative quantities', () => {
    expect(() => Stock.create(-1)).toThrow(
      'Stock quantity must be a non-negative integer',
    );
  });

  it('rejects non-integer quantities', () => {
    expect(() => Stock.create(1.5)).toThrow(
      'Stock quantity must be a non-negative integer',
    );
  });

  it('reports whether it has at least a given amount', () => {
    const stock = Stock.create(5);

    expect(stock.hasAtLeast(5)).toBe(true);
    expect(stock.hasAtLeast(6)).toBe(false);
  });

  it('decreases returning a new Stock instance', () => {
    const stock = Stock.create(5);
    const decreased = stock.decrease(2);

    expect(decreased.value).toBe(3);
    expect(stock.value).toBe(5);
  });

  it('rejects decreasing by a non-positive amount', () => {
    expect(() => Stock.create(5).decrease(0)).toThrow(
      'Decrease amount must be positive',
    );
  });

  it('rejects decreasing below zero', () => {
    expect(() => Stock.create(1).decrease(2)).toThrow('Insufficient stock');
  });
});
