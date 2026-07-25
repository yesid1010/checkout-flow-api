import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'product_amount_in_cents', type: 'integer' })
  productAmountInCents: number;

  @Column({ name: 'base_fee_in_cents', type: 'integer' })
  baseFeeInCents: number;

  @Column({ name: 'delivery_fee_in_cents', type: 'integer' })
  deliveryFeeInCents: number;

  @Column()
  status: string;

  @Column({ name: 'gateway_reference', type: 'varchar', nullable: true })
  gatewayReference?: string;
}
