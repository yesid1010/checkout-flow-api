import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetProductUseCase } from '../application/get-product.usecase';
import { ListProductsUseCase } from '../application/list-products.usecase';
import { PRODUCT_REPOSITORY } from '../domain/product.repository';
import { ProductController } from './http/product.controller';
import { ProductOrmEntity } from './persistence/product.orm-entity';
import { ProductTypeOrmRepository } from './persistence/product.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    GetProductUseCase,
    ListProductsUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: ProductTypeOrmRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
