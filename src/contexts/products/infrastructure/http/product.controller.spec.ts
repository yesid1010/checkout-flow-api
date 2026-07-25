import { NotFoundException } from '@nestjs/common';
import { Result } from '../../../../shared/domain/result';
import { GetProductUseCase } from '../../application/get-product.usecase';
import { ListProductsUseCase } from '../../application/list-products.usecase';
import { ProductController } from './product.controller';

describe('ProductController', () => {
  const productPrimitives = {
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling',
    priceInCents: 25000_00,
    stock: 5,
  };

  it('list returns every product from ListProductsUseCase', async () => {
    const listProducts = {
      execute: jest.fn().mockResolvedValue([productPrimitives]),
    } as unknown as ListProductsUseCase;
    const controller = new ProductController({} as GetProductUseCase, listProducts);

    const result = await controller.list();

    expect(result).toEqual([productPrimitives]);
  });

  it('findOne returns the product when found', async () => {
    const getProduct = {
      execute: jest.fn().mockResolvedValue(Result.ok(productPrimitives)),
    } as unknown as GetProductUseCase;
    const controller = new ProductController(getProduct, {} as ListProductsUseCase);

    const result = await controller.findOne('prod-1');

    expect(result).toEqual(productPrimitives);
  });

  it('findOne throws NotFoundException when the product does not exist', async () => {
    const getProduct = {
      execute: jest.fn().mockResolvedValue(Result.err({ type: 'PRODUCT_NOT_FOUND' })),
    } as unknown as GetProductUseCase;
    const controller = new ProductController(getProduct, {} as ListProductsUseCase);

    await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
