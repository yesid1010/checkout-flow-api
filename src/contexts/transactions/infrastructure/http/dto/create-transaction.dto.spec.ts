import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DocumentType } from '../../../../customers/domain/customer.entity';
import { CreateTransactionDto } from './create-transaction.dto';

const validPayload = {
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

describe('CreateTransactionDto', () => {
  it('accepts a fully valid payload', async () => {
    const dto = plainToInstance(CreateTransactionDto, validPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a payload without the optional addressDetails', async () => {
    const dto = plainToInstance(CreateTransactionDto, validPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a non-UUID productId', async () => {
    const dto = plainToInstance(CreateTransactionDto, { ...validPayload, productId: 'not-a-uuid' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'productId')).toBe(true);
  });

  it('rejects an invalid customer email', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      customer: { ...validPayload.customer, email: 'not-an-email' },
    });

    const errors = await validate(dto);
    const customerErrors = errors.find((error) => error.property === 'customer');

    expect(customerErrors?.children?.some((child) => child.property === 'email')).toBe(true);
  });

  it('rejects an invalid documentType', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      customer: { ...validPayload.customer, documentType: 'INVALID' },
    });

    const errors = await validate(dto);
    const customerErrors = errors.find((error) => error.property === 'customer');

    expect(
      customerErrors?.children?.some((child) => child.property === 'documentType'),
    ).toBe(true);
  });

  it('rejects a missing delivery address', async () => {
    const { address, ...deliveryWithoutAddress } = validPayload.delivery;
    void address;
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      delivery: deliveryWithoutAddress,
    });

    const errors = await validate(dto);
    const deliveryErrors = errors.find((error) => error.property === 'delivery');

    expect(deliveryErrors?.children?.some((child) => child.property === 'address')).toBe(true);
  });

  it('rejects installments below 1', async () => {
    const dto = plainToInstance(CreateTransactionDto, { ...validPayload, installments: 0 });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'installments')).toBe(true);
  });
});
