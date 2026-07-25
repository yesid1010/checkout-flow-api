import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';
import { ProductRepository } from '../../domain/product.repository';
import { Stock } from '../../domain/stock.vo';
import { ProductOrmEntity } from './product.orm-entity';

@Injectable()
export class ProductTypeOrmRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const row = await this.repository.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.repository.find();
    return rows.map((row) => this.toDomain(row));
  }

  /**
   * Atomic UPDATE ... WHERE stock >= quantity: when two requests race for
   * the last unit, only the one whose UPDATE still sees enough stock at
   * the DB level affects a row. The loser gets affected = 0, i.e. false.
   */
  async decreaseStock(id: string, quantity: number): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => 'stock - :quantity' })
      .where('id = :id', { id })
      .andWhere('stock >= :quantity', { quantity })
      .setParameter('quantity', quantity)
      .execute();

    return (result.affected ?? 0) > 0;
  }

  private toDomain(row: ProductOrmEntity): Product {
    return Product.create({
      id: row.id,
      name: row.name,
      description: row.description,
      priceInCents: row.priceInCents,
      stock: Stock.create(row.stock),
    });
  }
}
