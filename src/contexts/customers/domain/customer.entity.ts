import { Email } from './email.vo';

export enum DocumentType {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PP = 'PP',
  NIT = 'NIT',
}

export interface CustomerProps {
  id: string;
  fullName: string;
  email: Email;
  documentType: DocumentType;
  documentNumber: string;
  phoneNumber: string;
}

export interface CustomerPrimitives {
  id: string;
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  phoneNumber: string;
}

export class Customer {
  private constructor(private readonly props: CustomerProps) {}

  static create(props: CustomerProps): Customer {
    if (!props.fullName.trim()) {
      throw new Error('Customer full name cannot be empty');
    }
    if (!props.documentNumber.trim()) {
      throw new Error('Customer document number cannot be empty');
    }
    if (!props.phoneNumber.trim()) {
      throw new Error('Customer phone number cannot be empty');
    }
    return new Customer(props);
  }

  get id(): string {
    return this.props.id;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get email(): Email {
    return this.props.email;
  }

  get documentType(): DocumentType {
    return this.props.documentType;
  }

  get documentNumber(): string {
    return this.props.documentNumber;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  toPrimitives(): CustomerPrimitives {
    return {
      id: this.props.id,
      fullName: this.props.fullName,
      email: this.props.email.value,
      documentType: this.props.documentType,
      documentNumber: this.props.documentNumber,
      phoneNumber: this.props.phoneNumber,
    };
  }
}
