import { NextRequest, NextResponse } from 'next/server';
import { Stat, AuditLog, AuditAction } from '@/lib/db/models';
import { createStatSchema } from '@/lib/validations/stat';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const stats = await Stat.findAll({
      where: { active: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
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

    // @ts-expect-error - Temporary fix for model/validation schema mismatch
    const stat = await Stat.create({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.CREATE,
      entity: 'stats',
      entityId: stat.id,
      diff: { newValues: validatedData },
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