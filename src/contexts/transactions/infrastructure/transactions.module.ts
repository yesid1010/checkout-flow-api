import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../../customers/infrastructure/customers.module';
import { DeliveriesModule } from '../../deliveries/infrastructure/deliveries.module';
import { ProductsModule } from '../../products/infrastructure/products.module';
import { CreateTransactionUseCase } from '../application/create-transaction.usecase';
import { GetTransactionUseCase } from '../application/get-transaction.usecase';
import { PAYMENT_GATEWAY } from '../domain/payment-gateway.port';
import { TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import { WompiGatewayAdapter } from './gateway/wompi-gateway.adapter';
import { TransactionController } from './http/transaction.controller';
import { TransactionOrmEntity } from './persistence/transaction.orm-entity';
import { TransactionTypeOrmRepository } from './persistence/transaction.typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrmEntity]),
    HttpModule,
    ProductsModule,
    CustomersModule,
    DeliveriesModule,
  ],
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionTypeOrmRepository },
    { provide: PAYMENT_GATEWAY, useClass: WompiGatewayAdapter },
  ],
})
export class TransactionsModule {}
