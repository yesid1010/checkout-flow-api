import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ name: 'price_in_cents', type: 'integer' })
  priceInCents: number;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'integer' })
  stock: number;
}
