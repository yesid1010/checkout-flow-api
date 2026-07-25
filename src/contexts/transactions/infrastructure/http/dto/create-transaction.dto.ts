import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { DocumentType } from '../../../../customers/domain/customer.entity';

export class CustomerDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  documentNumber: string;

  @IsString()
  phoneNumber: string;
}

export class DeliveryDto {
  @IsString()
  recipientName: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  addressDetails?: string;
}

export class CreateTransactionDto {
  @IsUUID()
  productId: string;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;

  @IsString()
  cardToken: string;

  @IsInt()
  @Min(1)
  installments: number;
}
