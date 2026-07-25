import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'deliveries' })
export class DeliveryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({ name: 'recipient_phone' })
  recipientPhone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ name: 'address_details', type: 'varchar', nullable: true })
  addressDetails?: string;

  @Column()
  status: string;
}
