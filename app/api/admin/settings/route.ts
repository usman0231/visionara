import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/settings
 * Fetch all settings
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await Setting.findAll({
      order: [['key', 'ASC']]
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Create a new setting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const setting = await Setting.create({
      key: body.key,
      value: body.value
    });

    return NextResponse.json(setting, { status: 201 });
  } catch (error: any) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { error: 'Failed to create setting', details: error.message },
      { status: 500 }
    );
  }
}