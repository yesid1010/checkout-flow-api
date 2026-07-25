import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CustomerOrmEntity } from '../contexts/customers/infrastructure/persistence/customer.orm-entity';
import { DeliveryOrmEntity } from '../contexts/deliveries/infrastructure/persistence/delivery.orm-entity';
import { ProductOrmEntity } from '../contexts/products/infrastructure/persistence/product.orm-entity';
import { TransactionOrmEntity } from '../contexts/transactions/infrastructure/persistence/transaction.orm-entity';

config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ProductOrmEntity, CustomerOrmEntity, DeliveryOrmEntity, TransactionOrmEntity],
  synchronize: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
