import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Result } from '../../../../shared/domain/result';
import { CreateTransactionUseCase } from '../../application/create-transaction.usecase';
import { GetTransactionUseCase } from '../../application/get-transaction.usecase';
import { TransactionController } from './transaction.controller';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DocumentType } from '../../../customers/domain/customer.entity';

describe('TransactionController', () => {
  const dto: CreateTransactionDto = {
    productId: '11111111-1111-4111-8111-111111111111',
    customer: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      documentType: DocumentType.CC,
      documentNumber: '123456789',
      phoneNumber: '+573001112233',
    },
    delivery: {
      recipientName: 'Jane Doe',
      recipientPhone: '+573001112233',
      address: 'Cra 7 # 45-12',
      city: 'Bogotá',
    },
    cardToken: 'tok_stagtest_1',
    installments: 1,
  };

  const outcome = { transactionId: 'tx-1', status: 'APPROVED', totalInCents: 2630000 };

  it('create returns the outcome on success', async () => {
    const createTransaction = {
      execute: jest.fn().mockResolvedValue(Result.ok(outcome)),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionController(createTransaction, {} as GetTransactionUseCase);

    const result = await controller.create(dto);

    expect(result).toEqual(outcome);
  });

  it('create throws NotFoundException for PRODUCT_NOT_FOUND', async () => {
    const createTransaction = {
      execute: jest.fn().mockResolvedValue(Result.err({ type: 'PRODUCT_NOT_FOUND' })),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionController(createTransaction, {} as GetTransactionUseCase);

    await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('create throws UnprocessableEntityException for OUT_OF_STOCK', async () => {
    const createTransaction = {
      execute: jest.fn().mockResolvedValue(Result.err({ type: 'OUT_OF_STOCK' })),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionController(createTransaction, {} as GetTransactionUseCase);

    await expect(controller.create(dto)).rejects.toThrow(UnprocessableEntityException);
  });

  it('create throws UnprocessableEntityException for a gateway error', async () => {
    const createTransaction = {
      execute: jest
        .fn()
        .mockResolvedValue(Result.err({ type: 'GATEWAY_ERROR', message: 'boom' })),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionController(createTransaction, {} as GetTransactionUseCase);

    await expect(controller.create(dto)).rejects.toThrow(UnprocessableEntityException);
  });

  it('findOne returns the transaction when found', async () => {
    const transactionPrimitives = { id: 'tx-1', status: 'APPROVED' };
    const getTransaction = {
      execute: jest.fn().mockResolvedValue(Result.ok(transactionPrimitives)),
    } as unknown as GetTransactionUseCase;
    const controller = new TransactionController({} as CreateTransactionUseCase, getTransaction);

    const result = await controller.findOne('tx-1');

    expect(result).toEqual(transactionPrimitives);
  });

  it('findOne throws NotFoundException when missing', async () => {
    const getTransaction = {
      execute: jest.fn().mockResolvedValue(Result.err({ type: 'TRANSACTION_NOT_FOUND' })),
    } as unknown as GetTransactionUseCase;
    const controller = new TransactionController({} as CreateTransactionUseCase, getTransaction);

    await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
