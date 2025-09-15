import { NextResponse } from 'next/server';
import { ensureSchema } from '@/lib/auth/ensureSchema';

export const runtime = 'nodejs';

/**
 * GET /api/admin/schema-status
 * Check if database schema is initialized
 * Used by client components to determine setup state
 */
export async function GET() {
  try {
    const schemaResult = await ensureSchema();
    
    return NextResponse.json({
      initialized: schemaResult.initialized,
      error: schemaResult.error || null,
      missingTables: schemaResult.missingTables || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Schema status check failed:', error);
    
    return NextResponse.json(
      {
        initialized: false,
        error: error.message || 'Failed to check schema status',
        missingTables: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}