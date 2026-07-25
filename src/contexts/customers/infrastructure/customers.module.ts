import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUSTOMER_REPOSITORY } from '../domain/customer.repository';
import { CustomerOrmEntity } from './persistence/customer.orm-entity';
import { CustomerTypeOrmRepository } from './persistence/customer.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  providers: [{ provide: CUSTOMER_REPOSITORY, useClass: CustomerTypeOrmRepository }],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
