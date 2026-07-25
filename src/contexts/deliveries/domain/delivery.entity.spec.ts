import { Delivery, DeliveryStatus } from './delivery.entity';

const buildProps = (overrides: Partial<Parameters<typeof Delivery.create>[0]> = {}) => ({
  id: 'del-1',
  transactionId: 'tx-1',
  recipientName: 'Jane Doe',
  recipientPhone: '+573001112233',
  address: 'Cra 7 # 45-12',
  city: 'Bogotá',
  ...overrides,
});

describe('Delivery', () => {
  it('creates a delivery defaulting to PENDING status', () => {
    const delivery = Delivery.create(buildProps());

    expect(delivery.id).toBe('del-1');
    expect(delivery.status).toBe(DeliveryStatus.PENDING);
    expect(delivery.transactionId).toBe('tx-1');
    expect(delivery.recipientName).toBe('Jane Doe');
    expect(delivery.recipientPhone).toBe('+573001112233');
    expect(delivery.address).toBe('Cra 7 # 45-12');
    expect(delivery.city).toBe('Bogotá');
    expect(delivery.addressDetails).toBeUndefined();
  });

  it('accepts optional address details', () => {
    const delivery = Delivery.create(buildProps({ addressDetails: 'Apto 302' }));

    expect(delivery.addressDetails).toBe('Apto 302');
  });

  it('rejects an empty recipient name', () => {
    expect(() => Delivery.create(buildProps({ recipientName: ' ' }))).toThrow(
      'Delivery recipient name cannot be empty',
    );
  });

  it('rejects an empty address', () => {
    expect(() => Delivery.create(buildProps({ address: '' }))).toThrow(
      'Delivery address cannot be empty',
    );
  });

  it('rejects an empty city', () => {
    expect(() => Delivery.create(buildProps({ city: '' }))).toThrow(
      'Delivery city cannot be empty',
    );
  });

  it('assign() transitions PENDING to ASSIGNED without mutating the original', () => {
    const delivery = Delivery.create(buildProps());
    const assigned = delivery.assign();

    expect(assigned.status).toBe(DeliveryStatus.ASSIGNED);
    expect(delivery.status).toBe(DeliveryStatus.PENDING);
  });

  it('rejects assigning a delivery that is already ASSIGNED', () => {
    const assigned = Delivery.create(buildProps()).assign();

    expect(() => assigned.assign()).toThrow('Delivery is already assigned');
  });

  it('serializes to primitives', () => {
    const delivery = Delivery.create(buildProps({ addressDetails: 'Apto 302' }));

    expect(delivery.toPrimitives()).toEqual({
      id: 'del-1',
      transactionId: 'tx-1',
      recipientName: 'Jane Doe',
      recipientPhone: '+573001112233',
      address: 'Cra 7 # 45-12',
      city: 'Bogotá',
      addressDetails: 'Apto 302',
      status: DeliveryStatus.PENDING,
    });
  });
});
