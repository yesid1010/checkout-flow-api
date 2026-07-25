import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { CreateChargeInput } from '../../domain/payment-gateway.port';
import { WompiGatewayAdapter } from './wompi-gateway.adapter';

const ENV: Record<string, string> = {
  WOMPI_BASE_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
  WOMPI_PUBLIC_KEY: 'pub_stagtest_xxx',
  WOMPI_PRIVATE_KEY: 'prv_stagtest_xxx',
  WOMPI_INTEGRITY_KEY: 'stagtest_integrity_xxx',
};

const buildConfig = (): ConfigService =>
  ({ get: (key: string) => ENV[key] }) as unknown as ConfigService;

describe('WompiGatewayAdapter', () => {
  let adapter: WompiGatewayAdapter;
  let http: { get: jest.Mock; post: jest.Mock };

  const chargeInput: CreateChargeInput = {
    reference: 'tx-1',
    amountInCents: 100_000,
    currency: 'COP',
    customerEmail: 'jane@example.com',
    cardToken: 'tok_stagtest_1',
    installments: 1,
  };

  beforeEach(() => {
    http = { get: jest.fn(), post: jest.fn() };
    adapter = new WompiGatewayAdapter(http as unknown as HttpService, buildConfig());
  });

  describe('createCharge', () => {
    it('fetches the acceptance token, signs the request and returns the charge result', async () => {
      http.get.mockReturnValueOnce(
        of({ data: { data: { presigned_acceptance: { acceptance_token: 'accept-1' } } } }),
      );
      http.post.mockReturnValueOnce(
        of({ data: { data: { id: 'wompi-tx-1', status: 'PENDING' } } }),
      );

      const result = await adapter.createCharge(chargeInput);

      expect(http.get).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_stagtest_xxx',
      );
      expect(http.post).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/transactions',
        expect.objectContaining({
          acceptance_token: 'accept-1',
          amount_in_cents: 100_000,
          currency: 'COP',
          reference: 'tx-1',
          signature: expect.any(String),
          payment_method: { type: 'CARD', token: 'tok_stagtest_1', installments: 1 },
        }),
        { headers: { Authorization: 'Bearer prv_stagtest_xxx' } },
      );
      expect(result.isOk).toBe(true);
      expect(result.value).toEqual({
        gatewayTransactionId: 'wompi-tx-1',
        status: 'PENDING',
      });
    });

    it('returns a Result.err when fetching the acceptance token fails', async () => {
      http.get.mockReturnValueOnce(throwError(() => new Error('network down')));

      const result = await adapter.createCharge(chargeInput);

      expect(result.isErr).toBe(true);
      expect(result.error).toEqual({ type: 'NETWORK_ERROR', message: 'network down' });
      expect(http.post).not.toHaveBeenCalled();
    });

    it('returns a Result.err when the charge request itself fails', async () => {
      http.get.mockReturnValueOnce(
        of({ data: { data: { presigned_acceptance: { acceptance_token: 'accept-1' } } } }),
      );
      http.post.mockReturnValueOnce(throwError(() => new Error('declined by gateway')));

      const result = await adapter.createCharge(chargeInput);

      expect(result.isErr).toBe(true);
      expect(result.error.message).toBe('declined by gateway');
    });
  });

  describe('getTransactionStatus', () => {
    it.each([
      ['APPROVED', 'APPROVED'],
      ['DECLINED', 'DECLINED'],
      ['ERROR', 'ERROR'],
      ['VOIDED', 'PENDING'],
    ])('maps gateway status %s to %s', async (gatewayStatus, expectedStatus) => {
      http.get.mockReturnValueOnce(
        of({ data: { data: { id: 'wompi-tx-1', status: gatewayStatus } } }),
      );

      const result = await adapter.getTransactionStatus('wompi-tx-1');

      expect(result.value).toEqual({
        gatewayTransactionId: 'wompi-tx-1',
        status: expectedStatus,
      });
    });

    it('returns a Result.err when the status request fails', async () => {
      http.get.mockReturnValueOnce(throwError(() => new Error('timeout')));

      const result = await adapter.getTransactionStatus('wompi-tx-1');

      expect(result.isErr).toBe(true);
      expect(result.error).toEqual({ type: 'NETWORK_ERROR', message: 'timeout' });
    });

    it('wraps a non-Error thrown value with a generic message', async () => {
      http.get.mockReturnValueOnce(throwError(() => 'plain string error'));

      const result = await adapter.getTransactionStatus('wompi-tx-1');

      expect(result.error.message).toBe('Unknown gateway error');
    });
  });
});
