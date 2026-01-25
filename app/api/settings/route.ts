import { NextResponse } from 'next/server';
import { Setting } from '@/lib/db/models';

export const runtime = 'nodejs';

/**
 * GET /api/settings
 * Public endpoint to fetch all settings for the frontend
 */
export async function GET() {
  try {
    const settings = await Setting.findAll({
      order: [['key', 'ASC']],
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}
