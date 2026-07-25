export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export interface TransactionProps {
  id: string;
  productId: string;
  customerId: string;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  status: TransactionStatus;
  gatewayReference?: string;
}

export type CreateTransactionProps = Omit<TransactionProps, 'status' | 'gatewayReference'>;

export interface TransactionPrimitives extends TransactionProps {
  totalInCents: number;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(props: CreateTransactionProps): Transaction {
    if (!Number.isInteger(props.productAmountInCents) || props.productAmountInCents <= 0) {
      throw new Error('Product amount must be a positive integer amount of cents');
    }
    if (!Number.isInteger(props.baseFeeInCents) || props.baseFeeInCents < 0) {
      throw new Error('Base fee must be a non-negative integer amount of cents');
    }
    if (!Number.isInteger(props.deliveryFeeInCents) || props.deliveryFeeInCents < 0) {
      throw new Error('Delivery fee must be a non-negative integer amount of cents');
    }
    return new Transaction({ ...props, status: TransactionStatus.PENDING });
  }

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get productAmountInCents(): number {
    return this.props.productAmountInCents;
  }

  get baseFeeInCents(): number {
    return this.props.baseFeeInCents;
  }

  get deliveryFeeInCents(): number {
    return this.props.deliveryFeeInCents;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get gatewayReference(): string | undefined {
    return this.props.gatewayReference;
  }

  get totalInCents(): number {
    return (
      this.props.productAmountInCents +
      this.props.baseFeeInCents +
      this.props.deliveryFeeInCents
    );
  }

  get isFinal(): boolean {
    return this.props.status !== TransactionStatus.PENDING;
  }

  approve(gatewayReference: string): Transaction {
    this.ensurePending();
    return new Transaction({
      ...this.props,
      status: TransactionStatus.APPROVED,
      gatewayReference,
    });
  }

  decline(gatewayReference: string): Transaction {
    this.ensurePending();
    return new Transaction({
      ...this.props,
      status: TransactionStatus.DECLINED,
      gatewayReference,
    });
  }

  markAsError(): Transaction {
    this.ensurePending();
    return new Transaction({ ...this.props, status: TransactionStatus.ERROR });
  }

  private ensurePending(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new Error(`Transaction ${this.props.id} is already ${this.props.status}`);
    }
  }

  toPrimitives(): TransactionPrimitives {
    return { ...this.props, totalInCents: this.totalInCents };
  }
}
