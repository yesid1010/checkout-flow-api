export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
}

export interface DeliveryProps {
  id: string;
  transactionId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  addressDetails?: string;
  status: DeliveryStatus;
}

export type CreateDeliveryProps = Omit<DeliveryProps, 'status'> & {
  status?: DeliveryStatus;
};

export interface DeliveryPrimitives {
  id: string;
  transactionId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  addressDetails?: string;
  status: DeliveryStatus;
}

export class Delivery {
  private constructor(private readonly props: DeliveryProps) {}

  static create(props: CreateDeliveryProps): Delivery {
    if (!props.recipientName.trim()) {
      throw new Error('Delivery recipient name cannot be empty');
    }
    if (!props.address.trim()) {
      throw new Error('Delivery address cannot be empty');
    }
    if (!props.city.trim()) {
      throw new Error('Delivery city cannot be empty');
    }
    return new Delivery({ ...props, status: props.status ?? DeliveryStatus.PENDING });
  }

  get id(): string {
    return this.props.id;
  }

  get transactionId(): string {
    return this.props.transactionId;
  }

  get recipientName(): string {
    return this.props.recipientName;
  }

  get recipientPhone(): string {
    return this.props.recipientPhone;
  }

  get address(): string {
    return this.props.address;
  }

  get city(): string {
    return this.props.city;
  }

  get addressDetails(): string | undefined {
    return this.props.addressDetails;
  }

  get status(): DeliveryStatus {
    return this.props.status;
  }

  assign(): Delivery {
    if (this.props.status === DeliveryStatus.ASSIGNED) {
      throw new Error('Delivery is already assigned');
    }
    return new Delivery({ ...this.props, status: DeliveryStatus.ASSIGNED });
  }

  toPrimitives(): DeliveryPrimitives {
    return { ...this.props };
  }
}
