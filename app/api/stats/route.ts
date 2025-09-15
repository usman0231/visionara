import { NextRequest, NextResponse } from 'next/server';
import { Stat, AuditLog } from '@/lib/db/models';
import { createStatSchema } from '@/lib/validations/stat';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const stats = await Stat.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createStatSchema.parse(body);

    const stat = await Stat.create({
      ...validatedData,
      createdBy: userId,
    });

    await AuditLog.create({
      userId,
      action: 'CREATE',
      tableName: 'stats',
      recordId: stat.id,
      newValues: validatedData,
    });

    return NextResponse.json({ stat }, { status: 201 });
  } catch (error: any) {
    console.error('Create stat error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create stat', details: error.message },
      { status: 500 }
    );
  }
}