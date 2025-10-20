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

  try {
    const parsed = new URL(env.DATABASE_URL);
    hostname = parsed.hostname;
  } catch (error) {
    console.warn('Warning: Failed to parse DATABASE_URL for SSL configuration.', error);
  }

  const isLocalHost = hostname ? LOCAL_HOSTS.has(hostname) : false;

  // Check if using Supabase
  const isSupabase = hostname && (
    hostname.includes('supabase.com') ||
    hostname.includes('supabase.co')
  );

  // For Supabase or localhost, disable certificate validation
  // This is required because:
  // - Supabase pooler certificates are not in Node's CA store
  // - Localhost may use self-signed certificates
  if (isSupabase || isLocalHost) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    };
  }

  // For other databases, require proper SSL validation
  return {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  };
};

const dialectOptions = resolveDialectOptions();

// Log SSL configuration for debugging
console.log('🔒 SSL Configuration:', {
  dialectOptions,
  isVercel: process.env.VERCEL === '1',
  nodeEnv: process.env.NODE_ENV,
});

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
  dialectOptions: dialectOptions || undefined,
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
