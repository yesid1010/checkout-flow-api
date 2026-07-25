import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'customers' })
export class CustomerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'document_number' })
  documentNumber: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;
}
