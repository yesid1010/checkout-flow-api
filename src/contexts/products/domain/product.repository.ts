import { Product } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;

  /**
   * Atomically decreases stock (e.g. `UPDATE ... WHERE stock >= quantity`).
   * Returns false when there isn't enough stock left, so concurrent buyers
   * of the last unit can't both succeed.
   */
  decreaseStock(id: string, quantity: number): Promise<boolean>;
}
