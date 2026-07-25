import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetProductUseCase } from '../../application/get-product.usecase';
import { ListProductsUseCase } from '../../application/list-products.usecase';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getProduct: GetProductUseCase,
    private readonly listProducts: ListProductsUseCase,
  ) {}

  @Get()
  async list() {
    return this.listProducts.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.getProduct.execute(id);
    if (result.isErr) {
      throw new NotFoundException('Product not found');
    }
    return result.value;
  }
}
