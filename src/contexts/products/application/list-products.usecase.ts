import { Inject, Injectable } from '@nestjs/common';
import { ProductPrimitives } from '../domain/product.entity';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';
import type { ProductRepository } from '../domain/product.repository';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(): Promise<ProductPrimitives[]> {
    const products = await this.products.findAll();
    return products.map((product) => product.toPrimitives());
  }
}
