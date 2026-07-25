import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './contexts/customers/infrastructure/customers.module';
import { DeliveriesModule } from './contexts/deliveries/infrastructure/deliveries.module';
import { ProductsModule } from './contexts/products/infrastructure/products.module';
import { TransactionsModule } from './contexts/transactions/infrastructure/transactions.module';
import { validate } from './shared/config/env.validation';
import { DatabaseModule } from './shared/infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DatabaseModule,
    ProductsModule,
    CustomersModule,
    DeliveriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
