import { Stock } from './stock.vo';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: Stock;
}

export interface ProductPrimitives {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: ProductProps): Product {
    if (!props.name.trim()) {
      throw new Error('Product name cannot be empty');
    }
    if (!Number.isInteger(props.priceInCents) || props.priceInCents <= 0) {
      throw new Error('Product price must be a positive integer amount of cents');
    }
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get stock(): Stock {
    return this.props.stock;
  }

  hasAvailableStock(quantity: number): boolean {
    return this.props.stock.hasAtLeast(quantity);
  }

  toPrimitives(): ProductPrimitives {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      priceInCents: this.props.priceInCents,
      stock: this.props.stock.value,
    };
  }
}
