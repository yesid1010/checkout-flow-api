import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Result } from '../../../../shared/domain/result';
import {
  ChargeResult,
  CreateChargeInput,
  GatewayChargeStatus,
  PaymentGatewayError,
  PaymentGatewayPort,
} from '../../domain/payment-gateway.port';

interface WompiTransactionData {
  id: string;
  status: string;
}

interface WompiMerchantData {
  presigned_acceptance: { acceptance_token: string };
}

@Injectable()
export class WompiGatewayAdapter implements PaymentGatewayPort {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('WOMPI_BASE_URL') as string;
    this.publicKey = this.config.get<string>('WOMPI_PUBLIC_KEY') as string;
    this.privateKey = this.config.get<string>('WOMPI_PRIVATE_KEY') as string;
    this.integrityKey = this.config.get<string>('WOMPI_INTEGRITY_KEY') as string;
  }

  async createCharge(
    input: CreateChargeInput,
  ): Promise<Result<ChargeResult, PaymentGatewayError>> {
    try {
      const acceptanceToken = await this.fetchAcceptanceToken();
      const signature = this.buildIntegritySignature(
        input.reference,
        input.amountInCents,
        input.currency,
      );

      const response = await firstValueFrom(
        this.http.post<{ data: WompiTransactionData }>(
          `${this.baseUrl}/transactions`,
          {
            acceptance_token: acceptanceToken,
            amount_in_cents: input.amountInCents,
            currency: input.currency,
            customer_email: input.customerEmail,
            reference: input.reference,
            signature,
            payment_method: {
              type: 'CARD',
              token: input.cardToken,
              installments: input.installments,
            },
          },
          { headers: { Authorization: `Bearer ${this.privateKey}` } },
        ),
      );

      return Result.ok(this.toChargeResult(response.data.data));
    } catch (error) {
      return Result.err(this.toGatewayError(error));
    }
  }

  async getTransactionStatus(
    gatewayTransactionId: string,
  ): Promise<Result<ChargeResult, PaymentGatewayError>> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: WompiTransactionData }>(
          `${this.baseUrl}/transactions/${gatewayTransactionId}`,
          { headers: { Authorization: `Bearer ${this.privateKey}` } },
        ),
      );

      return Result.ok(this.toChargeResult(response.data.data));
    } catch (error) {
      return Result.err(this.toGatewayError(error));
    }
  }

  /**
   * The acceptance token (data-treatment terms) is fetched fresh from
   * Wompi with the public key right before charging, instead of trusting
   * a value the frontend could have supplied - it's cheap and closes off
   * a class of tampering.
   */
  private async fetchAcceptanceToken(): Promise<string> {
    const response = await firstValueFrom(
      this.http.get<{ data: WompiMerchantData }>(
        `${this.baseUrl}/merchants/${this.publicKey}`,
      ),
    );
    return response.data.data.presigned_acceptance.acceptance_token;
  }

  /**
   * Wompi's required signature: SHA-256(reference + amount_in_cents +
   * currency + integrity_secret). The integrity key never leaves the
   * backend, so this can only ever be computed here.
   */
  private buildIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    return createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${this.integrityKey}`)
      .digest('hex');
  }

  private toChargeResult(data: WompiTransactionData): ChargeResult {
    return { gatewayTransactionId: data.id, status: this.mapStatus(data.status) };
  }

  private mapStatus(status: string): GatewayChargeStatus {
    switch (status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'DECLINED':
        return 'DECLINED';
      case 'ERROR':
        return 'ERROR';
      default:
        return 'PENDING';
    }
  }

  private toGatewayError(error: unknown): PaymentGatewayError {
    const message = error instanceof Error ? error.message : 'Unknown gateway error';
    return { type: 'NETWORK_ERROR', message };
  }
}
