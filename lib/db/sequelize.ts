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

  if (['disable', 'off', 'false', 'no'].includes(mergedSslMode)) {
    return undefined;
  }

  const modeImpliesSelfSigned = mergedSslMode
    ? ['require', 'prefer', 'allow'].includes(mergedSslMode)
    : undefined;

  const defaultRequireSsl = mergedSslMode ? mergedSslMode !== 'allow' : !isLocalHost;

  const shouldForceSsl = isTruthy(process.env.DATABASE_SSL_REQUIRE, defaultRequireSsl);

  if (!shouldForceSsl) {
    return undefined;
  }

  // Check if using Supabase pooler (ports 5432 or 6543)
  const isSupabasePooler = hostname && (hostname.includes('pooler.supabase.com') || hostname.includes('.supabase.co'));

  // For Supabase, we can use their valid certificates
  const allowSelfSigned = isSupabasePooler
    ? false  // Supabase has valid certs, don't allow self-signed
    : isTruthy(
        process.env.DATABASE_SSL_ALLOW_SELF_SIGNED,
        modeImpliesSelfSigned ?? (isLocalHost || process.env.NODE_ENV !== 'production')
      );

  // Only set NODE_TLS_REJECT_UNAUTHORIZED if we actually need self-signed certs
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

// Detect if running in serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

// Pool configuration optimized for serverless and local development
const poolConfig = isServerless
  ? {
      // Serverless: Minimal connections, fast acquisition, short idle
      max: 1,  // Only 1 connection per function instance
      min: 0,  // No minimum connections
      acquire: 10000,  // 10 seconds timeout
      idle: 1000,  // Close idle connections after 1 second
      evict: 1000,  // Check for idle connections every second
    }
  : {
      // Local development: More connections, longer timeouts
      max: 3,  // Reduced from 5 to avoid Supabase session mode limits
      min: 0,
      acquire: 30000,
      idle: 10000,
    };

// Create Sequelize instance
export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  ...(dialectOptions ? { dialectOptions } : {}),
  pool: poolConfig,
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
