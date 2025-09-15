import { NextRequest, NextResponse } from 'next/server';
import { Stat, AuditLog, AuditAction } from '@/lib/db/models';
import { updateStatSchema } from '@/lib/validations/stat';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stat = await Stat.findByPk(id);

    if (!stat) {
      return NextResponse.json(
        { error: 'Stat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ stat });
  } catch (error: any) {
    console.error('Get stat error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stat', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const stat = await Stat.findByPk(id);

    if (!stat) {
      return NextResponse.json(
        { error: 'Stat not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateStatSchema.parse(body);
    const oldValues = stat.toJSON();

    // @ts-expect-error - Temporary fix for model/validation schema mismatch
    await stat.update({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.UPDATE,
      entity: 'stats',
      entityId: stat.id,
      diff: { oldValues, newValues: validatedData },
    });

    return NextResponse.json({ stat });
  } catch (error: any) {
    console.error('Update stat error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update stat', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const stat = await Stat.findByPk(id);

    if (!stat) {
      return NextResponse.json(
        { error: 'Stat not found' },
        { status: 404 }
      );
    }

    const oldValues = stat.toJSON();

    await stat.destroy();

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'stats',
      entityId: stat.id,
      diff: { oldValues },
    });

    return NextResponse.json({ message: 'Stat deleted successfully' });
  } catch (error: any) {
    console.error('Delete stat error:', error);
    return NextResponse.json(
      { error: 'Failed to delete stat', details: error.message },
      { status: 500 }
    );
  }
}