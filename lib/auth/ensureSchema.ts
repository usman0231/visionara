import { sequelize } from '@/lib/db/sequelize';
import { QueryTypes } from 'sequelize';

const REQUIRED_TABLES = [
  'roles',
  'users',
  'audit_logs',
  'services',
  'packages',
  'reviews',
  'gallery_items',
  'stats',
  'features_matrix',
  'settings',
  'contact_submissions',
  'seos'
];

export interface SchemaCheckResult {
  initialized: boolean;
  missingTables?: string[];
  error?: string;
}

/**
 * Check if all required database tables exist
 * Called before login to ensure schema is initialized
 */
// Cache schema check result to avoid repeated database queries
let schemaCheckCache: { result: SchemaCheckResult; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute cache

export async function ensureSchema(): Promise<SchemaCheckResult> {
  // Return cached result if available and not expired
  if (schemaCheckCache && Date.now() - schemaCheckCache.timestamp < CACHE_TTL) {
    return schemaCheckCache.result;
  }

  try {
    // Check for existing tables - Sequelize automatically manages connection pooling
    const existingTables = await sequelize.query<{ table_name: string }>(
      `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      `,
      {
        type: QueryTypes.SELECT,
        // Use a read-only transaction that doesn't hold connections
        transaction: undefined,
        raw: true,
      }
    );

    const existingTableNames = new Set(
      existingTables.map(row => row.table_name)
    );

    const missingTables = REQUIRED_TABLES.filter(
      table => !existingTableNames.has(table)
    );

    const result: SchemaCheckResult = missingTables.length > 0
      ? {
          initialized: false,
          missingTables
        }
      : { initialized: true };

    // Cache the result
    schemaCheckCache = {
      result,
      timestamp: Date.now()
    };

    if (missingTables.length > 0) {
      console.log(`❌ Missing database tables: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ All required database tables present');
    }

    return result;

  } catch (error) {
    console.error('❌ Database schema check failed:', error);
    const errorResult = {
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };

    // Cache error result for shorter time (10 seconds)
    schemaCheckCache = {
      result: errorResult,
      timestamp: Date.now() - (CACHE_TTL - 10000)
    };

    return errorResult;
  }
}

/**
 * Get schema initialization status for client components
 */
export async function getSchemaStatus(): Promise<{ initialized: boolean; error?: string }> {
  const result = await ensureSchema();
  return {
    initialized: result.initialized,
    error: result.error
  };
}