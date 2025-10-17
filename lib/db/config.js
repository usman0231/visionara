require('dotenv').config({ path: '.env.local' });

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const isTruthy = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const resolveDialectOptions = (databaseUrl) => {
  if (!databaseUrl) return undefined;

  let hostname = '';
  let sslModeFromUrl = '';

  try {
    const parsed = new URL(databaseUrl);
    hostname = parsed.hostname;
    sslModeFromUrl = (parsed.searchParams.get('sslmode') || '').toLowerCase();
  } catch (error) {
    console.warn('Warning: Failed to parse DATABASE_URL for CLI SSL configuration.', error);
  }

  const isLocalHost = hostname && LOCAL_HOSTS.has(hostname);
  const explicitSslMode = (process.env.DATABASE_SSL_MODE || '').toLowerCase();
  const mergedSslMode = explicitSslMode || sslModeFromUrl;

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

  const allowSelfSigned = isTruthy(
    process.env.DATABASE_SSL_ALLOW_SELF_SIGNED,
    modeImpliesSelfSigned ?? (isLocalHost || process.env.NODE_ENV !== 'production')
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

const createConfig = () => {
  const dialectOptions = resolveDialectOptions(process.env.DATABASE_URL);

  // Pool configuration for CLI operations (migrations, seeders)
  // Use minimal connections to avoid Supabase session mode limits
  const pool = {
    max: 2,  // Maximum 2 connections for CLI
    min: 0,
    acquire: 30000,
    idle: 10000,
  };

  return {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    pool,
    ...(dialectOptions ? { dialectOptions } : {}),
  };
};

module.exports = {
  development: createConfig(),
  production: createConfig(),
};
