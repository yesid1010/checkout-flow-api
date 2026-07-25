import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from '../../domain/delivery.entity';
import { DeliveryRepository } from '../../domain/delivery.repository';
import { DeliveryOrmEntity } from './delivery.orm-entity';

@Injectable()
export class DeliveryTypeOrmRepository implements DeliveryRepository {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repository: Repository<DeliveryOrmEntity>,
  ) {}

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.repository.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const row = await this.repository.findOneBy({ transactionId });
    return row ? this.toDomain(row) : null;
  }

  async save(delivery: Delivery): Promise<void> {
    const primitives = delivery.toPrimitives();
    await this.repository.save({
      id: primitives.id,
      transactionId: primitives.transactionId,
      recipientName: primitives.recipientName,
      recipientPhone: primitives.recipientPhone,
      address: primitives.address,
      city: primitives.city,
      addressDetails: primitives.addressDetails,
      status: primitives.status,
    });
  }

  private toDomain(row: DeliveryOrmEntity): Delivery {
    return Delivery.create({
      id: row.id,
      transactionId: row.transactionId,
      recipientName: row.recipientName,
      recipientPhone: row.recipientPhone,
      address: row.address,
      city: row.city,
      addressDetails: row.addressDetails,
      status: row.status as DeliveryStatus,
    });
  }
}
