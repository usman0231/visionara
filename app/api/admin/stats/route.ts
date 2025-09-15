import { NextRequest, NextResponse } from 'next/server';
import { Stat } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/stats
 * Fetch all stats
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await Stat.findAll({
      where: {
        deletedAt: null
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stats
 * Create a new stat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stat = await Stat.create({
      label: body.label,
      value: body.value,
      prefix: body.prefix || null,
      suffix: body.suffix || null,
      active: body.active !== undefined ? body.active : true,
      sortOrder: body.sortOrder || 0
    });

    return NextResponse.json(stat, { status: 201 });
  } catch (error: any) {
    console.error('Error creating stat:', error);
    return NextResponse.json(
      { error: 'Failed to create stat', details: error.message },
      { status: 500 }
    );
  }
}