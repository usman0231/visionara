// lib/sequelize.ts (use .js if you prefer JS)
import 'server-only';
import { Sequelize } from 'sequelize';

const isProd = process.env.NODE_ENV === 'production';

// Prefer pooled URL on serverless; fall back to DATABASE_URL
const connectionString =
  process.env.POOLED_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL/POOLED_DATABASE_URL in env.');
}

// Cache across hot-reloads in dev
let _sequelize: Sequelize | undefined;

// eslint-disable-next-line no-var
declare global { var __sequelize__: Sequelize | undefined; }

export function getSequelize() {
  if (_sequelize) return _sequelize;
  if (global.__sequelize__) return ( _sequelize = global.__sequelize__ );

  const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    protocol: 'postgres',
    // Supabase requires SSL; rejectUnauthorized:false is common with managed certs
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    // Keep pools conservative, especially with PgBouncer/serverless
    pool: {
      max: isProd ? 5 : 3,
      min: 0,
      acquire: 30_000,
      idle: 10_000,
      evict: 1_000,
    },
    logging: process.env.SQL_LOG === '1' ? console.log : false,
  });

  if (!isProd) global.__sequelize__ = sequelize;
  _sequelize = sequelize;
  return sequelize;
}

// Optional one-time connectivity check you can call at boot or in a health route
export async function assertDbConnection() {
  const sequelize = getSequelize();
  await sequelize.authenticate();
}
