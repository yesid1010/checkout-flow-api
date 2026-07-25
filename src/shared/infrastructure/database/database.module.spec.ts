import { ConfigService } from '@nestjs/config';
import { buildTypeOrmOptions } from './database.module';

const buildConfigService = (values: Record<string, string>): ConfigService =>
  ({
    get: (key: string) => values[key],
  }) as unknown as ConfigService;

describe('buildTypeOrmOptions', () => {
  it('enables synchronize and disables ssl outside production', () => {
    const config = buildConfigService({
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'checkout_flow',
    });

    const options = buildTypeOrmOptions(config) as Record<string, unknown>;

    expect(options.type).toBe('postgres');
    expect(options.host).toBe('localhost');
    expect(options.synchronize).toBe(true);
    expect(options.ssl).toBe(false);
    expect(options.autoLoadEntities).toBe(true);
  });

  it('disables synchronize and enables ssl in production', () => {
    const config = buildConfigService({
      NODE_ENV: 'production',
      DB_HOST: 'prod-host',
      DB_PORT: '5432',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'checkout_flow',
    });

    const options = buildTypeOrmOptions(config) as Record<string, unknown>;

    expect(options.synchronize).toBe(false);
    expect(options.ssl).toEqual({ rejectUnauthorized: false });
  });
});
