import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export const createTypeOrmOptions = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DATABASE_HOST', 'localhost'),
  port: Number(config.get('DATABASE_PORT', 5432)),
  username: config.get<string>('DATABASE_USER', 'postgres'),
  password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
  database: config.get<string>('DATABASE_NAME', 'karunia_center'),
  autoLoadEntities: true,
  synchronize: false,
  logging:
    config.get('NODE_ENV') === 'development' ? ['error', 'schema'] : false,
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});

export const createDataSourceOptions = (
  env: NodeJS.ProcessEnv,
): DataSourceOptions => ({
  type: 'postgres',
  host: env.DATABASE_HOST ?? 'localhost',
  port: Number(env.DATABASE_PORT ?? 5432),
  username: env.DATABASE_USER ?? 'postgres',
  password: env.DATABASE_PASSWORD ?? 'postgres',
  database: env.DATABASE_NAME ?? 'karunia_center',
  synchronize: false,
  logging:
    env.NODE_ENV === 'development' ? ['error', 'schema'] : false,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});
