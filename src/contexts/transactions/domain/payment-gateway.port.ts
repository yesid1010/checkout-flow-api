import { Result } from '../../../shared/domain/result';

export interface CreateChargeInput {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  cardToken: string;
  installments: number;
}

export type GatewayChargeStatus = 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';

export interface ChargeResult {
  gatewayTransactionId: string;
  status: GatewayChargeStatus;
}

export interface PaymentGatewayError {
  type: 'NETWORK_ERROR' | 'INVALID_RESPONSE';
  message: string;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGatewayPort {
  createCharge(input: CreateChargeInput): Promise<Result<ChargeResult, PaymentGatewayError>>;

  getTransactionStatus(
    gatewayTransactionId: string,
  ): Promise<Result<ChargeResult, PaymentGatewayError>>;
}
