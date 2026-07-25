import { validate } from './env.validation';

const validEnv = {
  NODE_ENV: 'development',
  PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_NAME: 'checkout_flow',
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
});
