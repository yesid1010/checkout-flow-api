import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../shared/domain/result';
import { ProductPrimitives } from '../domain/product.entity';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';
import type { ProductRepository } from '../domain/product.repository';

export interface GetProductError {
  type: 'PRODUCT_NOT_FOUND';
}

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
  ) {}

  async execute(id: string): Promise<Result<ProductPrimitives, GetProductError>> {
    const product = await this.products.findById(id);
    if (!product) {
      return Result.err({ type: 'PRODUCT_NOT_FOUND' });
    }
    return Result.ok(product.toPrimitives());
  }
}
