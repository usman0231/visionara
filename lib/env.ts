/**
 * Environment variable validation and configuration
 * READ-ONLY: Only reads from existing .env.local
 */

// Note: dotenv is automatically loaded by Next.js from .env.local
// No need to manually load it here

const requiredEnvVars = {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // server only
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  
  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  TO_EMAIL: process.env.TO_EMAIL,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Optional with defaults
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'media',
} as const;

// Validate required environment variables
function validateEnv() {
  const missing: string[] = [];

  // Only validate on server-side
  if (typeof window !== 'undefined') {
    // Client-side - only validate public env vars
    const clientCritical = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ] as const;

    for (const key of clientCritical) {
      if (!requiredEnvVars[key]) {
        missing.push(key);
      }
    }
  } else {
    // Server-side - validate all critical variables
    const critical = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_JWT_SECRET',
      'DATABASE_URL',
      'JWT_SECRET'
    ] as const;

    for (const key of critical) {
      if (!requiredEnvVars[key]) {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    // Only throw in production or when explicitly requested
    if (process.env.NODE_ENV === 'production' || process.env.FORCE_ENV_VALIDATION === 'true') {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please ensure these are set in your .env.local file.'
      );
    }
    return missing;
  }
  return [];
}

// Only validate environment variables on server-side
if (typeof window === 'undefined') {
  try {
    const missing = validateEnv();

    if (missing.length === 0) {
      console.log('✅ Environment variables validated successfully');
    } else {
      console.warn('⚠️ Missing environment variables:', missing.join(', '));
      console.log('Available env vars:', {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_JWT_SECRET: !!process.env.SUPABASE_JWT_SECRET,
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });

      // Only throw in production when server-side validation fails
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Missing required environment variables: ${missing.join(', ')}\n` +
          'Please ensure these are set in your production environment.'
        );
      }
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error);

    // In development, log more details but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Development mode: Continuing despite missing environment variables');
    } else {
      throw error;
    }
  }
}

// Create a getter function that validates on access
function createEnvGetter<T extends string>(key: keyof typeof requiredEnvVars, defaultValue: T = '' as T): T {
  return (requiredEnvVars[key] || defaultValue) as T;
}

// Export typed, frozen configuration with lazy validation
export const env = Object.freeze({
  // Public (client-safe)
  NEXT_PUBLIC_SUPABASE_URL: createEnvGetter('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: createEnvGetter('NEXT_PUBLIC_SUPABASE_ANON_KEY'),

  // Server-only Supabase
  SUPABASE_URL: createEnvGetter('SUPABASE_URL'),
  SUPABASE_ANON_KEY: createEnvGetter('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: createEnvGetter('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET: createEnvGetter('SUPABASE_JWT_SECRET'),
  SUPABASE_STORAGE_BUCKET: createEnvGetter('SUPABASE_STORAGE_BUCKET', 'media'),

  // Database
  DATABASE_URL: createEnvGetter('DATABASE_URL'),

  // SMTP
  SMTP_HOST: createEnvGetter('SMTP_HOST'),
  SMTP_PORT: parseInt(createEnvGetter('SMTP_PORT', '587')),
  SMTP_USER: createEnvGetter('SMTP_USER'),
  SMTP_PASS: createEnvGetter('SMTP_PASS'),
  TO_EMAIL: createEnvGetter('TO_EMAIL'),

  // JWT
  JWT_SECRET: createEnvGetter('JWT_SECRET'),
});

export type Env = typeof env;