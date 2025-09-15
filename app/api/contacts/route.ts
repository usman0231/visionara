import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission, AuditLog } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows: contacts } = await ContactSubmission.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return NextResponse.json({ 
      contacts,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit,
      }
    });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error.message },
      { status: 500 }
    );
  }
}