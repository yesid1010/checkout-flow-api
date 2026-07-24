import { Customer, DocumentType } from './customer.entity';
import { Email } from './email.vo';

const buildProps = (overrides: Partial<Parameters<typeof Customer.create>[0]> = {}) => ({
  id: 'cust-1',
  fullName: 'Jane Doe',
  email: Email.create('jane@example.com'),
  documentType: DocumentType.CC,
  documentNumber: '123456789',
  phoneNumber: '+573001112233',
  ...overrides,
});

describe('Customer', () => {
  it('creates a valid customer and exposes its properties', () => {
    const customer = Customer.create(buildProps());

    expect(customer.id).toBe('cust-1');
    expect(customer.fullName).toBe('Jane Doe');
    expect(customer.email.value).toBe('jane@example.com');
    expect(customer.documentType).toBe(DocumentType.CC);
    expect(customer.documentNumber).toBe('123456789');
    expect(customer.phoneNumber).toBe('+573001112233');
  });

  it('rejects an empty full name', () => {
    expect(() => Customer.create(buildProps({ fullName: '  ' }))).toThrow(
      'Customer full name cannot be empty',
    );
  });

  it('rejects an empty document number', () => {
    expect(() => Customer.create(buildProps({ documentNumber: '' }))).toThrow(
      'Customer document number cannot be empty',
    );
  });

  it('rejects an empty phone number', () => {
    expect(() => Customer.create(buildProps({ phoneNumber: '' }))).toThrow(
      'Customer phone number cannot be empty',
    );
  });

  it('serializes to primitives', () => {
    const customer = Customer.create(buildProps());

    expect(customer.toPrimitives()).toEqual({
      id: 'cust-1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      documentType: DocumentType.CC,
      documentNumber: '123456789',
      phoneNumber: '+573001112233',
    });
  });
});
