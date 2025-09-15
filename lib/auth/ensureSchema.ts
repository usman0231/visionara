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
  'contact_submissions'
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
export async function ensureSchema(): Promise<SchemaCheckResult> {
  try {
    // Test database connection first
    await sequelize.authenticate();
    
    // Check for existing tables
    const existingTables = await sequelize.query<{ table_name: string }>(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      `,
      { type: QueryTypes.SELECT }
    );
    
    const existingTableNames = new Set(
      existingTables.map(row => row.table_name)
    );
    
    const missingTables = REQUIRED_TABLES.filter(
      table => !existingTableNames.has(table)
    );
    
    if (missingTables.length > 0) {
      console.log(`❌ Missing database tables: ${missingTables.join(', ')}`);
      return {
        initialized: false,
        missingTables
      };
    }
    
    console.log('✅ All required database tables present');
    return { initialized: true };
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error);
    return {
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
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