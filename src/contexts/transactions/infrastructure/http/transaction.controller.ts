import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/create-transaction.usecase';
import { GetTransactionUseCase } from '../../application/get-transaction.usecase';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const result = await this.createTransaction.execute(dto);

    if (result.isOk) {
      return result.value;
    }

    if (result.error.type === 'PRODUCT_NOT_FOUND') {
      throw new NotFoundException('Product not found');
    }
    if (result.error.type === 'OUT_OF_STOCK') {
      throw new UnprocessableEntityException('Product is out of stock');
    }
    throw new UnprocessableEntityException(result.error.message);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.getTransaction.execute(id);
    if (result.isErr) {
      throw new NotFoundException('Transaction not found');
    }
    return result.value;
  }
}
