export class Stock {
  private constructor(private readonly quantity: number) {}

  static create(quantity: number): Stock {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('Stock quantity must be a non-negative integer');
    }
    return new Stock(quantity);
  }

  get value(): number {
    return this.quantity;
  }

  hasAtLeast(amount: number): boolean {
    return this.quantity >= amount;
  }

  decrease(amount: number): Stock {
    if (amount <= 0) {
      throw new Error('Decrease amount must be positive');
    }
    if (!this.hasAtLeast(amount)) {
      throw new Error('Insufficient stock');
    }
    return Stock.create(this.quantity - amount);
  }
}
