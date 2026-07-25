import { ProductOrmEntity } from '../../contexts/products/infrastructure/persistence/product.orm-entity';
import { AppDataSource } from '../data-source';
import { DUMMY_PRODUCTS } from './dummy-products';

async function run(): Promise<void> {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(ProductOrmEntity);

  for (const product of DUMMY_PRODUCTS) {
    const exists = await repository.findOneBy({ id: product.id });
    if (exists) {
      console.log(`Skipped (already exists): ${product.name}`);
      continue;
    }
    await repository.save(product);
    console.log(`Seeded product: ${product.name}`);
  }

  await AppDataSource.destroy();
}

run()
  .then(() => {
    console.log('Product seed finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Product seed failed:', error);
    process.exit(1);
  });
