import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DELIVERY_REPOSITORY } from '../domain/delivery.repository';
import { DeliveryOrmEntity } from './persistence/delivery.orm-entity';
import { DeliveryTypeOrmRepository } from './persistence/delivery.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryOrmEntity])],
  providers: [{ provide: DELIVERY_REPOSITORY, useClass: DeliveryTypeOrmRepository }],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesModule {}
