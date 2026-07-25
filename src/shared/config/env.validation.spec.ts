import { validate } from './env.validation';

const validEnv = {
  NODE_ENV: 'development',
  PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_NAME: 'checkout_flow',
  WOMPI_PUBLIC_KEY: 'pub_stagtest_xxx',
  WOMPI_PRIVATE_KEY: 'prv_stagtest_xxx',
  WOMPI_EVENTS_KEY: 'stagtest_events_xxx',
  WOMPI_INTEGRITY_KEY: 'stagtest_integrity_xxx',
  WOMPI_BASE_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
};

describe('validate (env)', () => {
  it('accepts a valid environment and coerces numeric strings', () => {
    const result = validate({ ...validEnv });

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.DB_PORT).toBe(5432);
  });

  it('rejects an invalid NODE_ENV', () => {
    expect(() => validate({ ...validEnv, NODE_ENV: 'staging' })).toThrow();
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => validate({ ...validEnv, PORT: 'not-a-port' })).toThrow();
  });

  it('rejects a missing required variable', () => {
    const { DB_HOST, ...withoutDbHost } = validEnv;
    void DB_HOST;

    expect(() => validate({ ...withoutDbHost })).toThrow();
  });

  it('accepts a valid environment without the optional FRONTEND_URL', () => {
    expect(() => validate({ ...validEnv })).not.toThrow();
  });

  it('accepts a valid environment with FRONTEND_URL set', () => {
    const result = validate({ ...validEnv, FRONTEND_URL: 'https://checkout.example.com' });

    expect(result.FRONTEND_URL).toBe('https://checkout.example.com');
  });
});
