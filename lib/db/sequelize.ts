import { Sequelize } from 'sequelize';
import { env } from '@/lib/env';

// Import pg explicitly for Turbopack compatibility
import * as pg from 'pg';

type DialectOptions = {
  ssl: {
    require: boolean;
    rejectUnauthorized: boolean;
  };
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const isTruthy = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const resolveDialectOptions = (): DialectOptions | undefined => {
  let hostname = '';
  let sslModeFromUrl: string | null = null;

  try {
    const parsed = new URL(env.DATABASE_URL);
    hostname = parsed.hostname;
    sslModeFromUrl = parsed.searchParams.get('sslmode');
  } catch (error) {
    console.warn('Warning: Failed to parse DATABASE_URL for SSL configuration.', error);
  }

  const isLocalHost = hostname ? LOCAL_HOSTS.has(hostname) : false;
  const explicitSslMode = process.env.DATABASE_SSL_MODE?.toLowerCase();
  const mergedSslMode = explicitSslMode ?? sslModeFromUrl?.toLowerCase() ?? '';

  const shouldForceSsl = isTruthy(process.env.DATABASE_SSL_REQUIRE, !isLocalHost);

  if (!shouldForceSsl || mergedSslMode === 'disable' || mergedSslMode === 'off' || mergedSslMode === 'false') {
    return undefined;
  }

  const allowSelfSigned = isTruthy(
    process.env.DATABASE_SSL_ALLOW_SELF_SIGNED,
    isLocalHost || process.env.NODE_ENV !== 'production'
  );

  if (allowSelfSigned && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return {
    ssl: {
      require: true,
      rejectUnauthorized: !allowSelfSigned,
    },
  };
};

const dialectOptions = resolveDialectOptions();

// Create Sequelize instance
export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  ...(dialectOptions ? { dialectOptions } : {}),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test connection
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    return false;
  }
}

export default sequelize;
