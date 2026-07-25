import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, DocumentType } from '../../domain/customer.entity';
import { CustomerRepository } from '../../domain/customer.repository';
import { Email } from '../../domain/email.vo';
import { CustomerOrmEntity } from './customer.orm-entity';

@Injectable()
export class CustomerTypeOrmRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repository: Repository<CustomerOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const row = await this.repository.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const row = await this.repository.findOneBy({ email: email.toLowerCase() });
    return row ? this.toDomain(row) : null;
  }

  async save(customer: Customer): Promise<void> {
    const primitives = customer.toPrimitives();
    await this.repository.save({
      id: primitives.id,
      fullName: primitives.fullName,
      email: primitives.email,
      documentType: primitives.documentType,
      documentNumber: primitives.documentNumber,
      phoneNumber: primitives.phoneNumber,
    });
  }

  private toDomain(row: CustomerOrmEntity): Customer {
    return Customer.create({
      id: row.id,
      fullName: row.fullName,
      email: Email.create(row.email),
      documentType: row.documentType as DocumentType,
      documentNumber: row.documentNumber,
      phoneNumber: row.phoneNumber,
    });
  }
}
