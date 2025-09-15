import { NextRequest, NextResponse } from 'next/server';
import { Setting, AuditLog, AuditAction } from '@/lib/db/models';
import { updateSettingSchema } from '@/lib/validations/setting';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const setting = await Setting.findOne({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ setting });
  } catch (error: any) {
    console.error('Get setting error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const setting = await Setting.findOne({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateSettingSchema.parse(body);
    const oldValues = setting.toJSON();

    await setting.update({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.UPDATE,
      entity: 'settings',
      entityId: setting.id,
      diff: { oldValues, newValues: validatedData },
    });

    return NextResponse.json({ setting });
  } catch (error: any) {
    console.error('Update setting error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update setting', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const setting = await Setting.findOne({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    const oldValues = setting.toJSON();

    await setting.destroy();

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'settings',
      entityId: setting.id,
      diff: { oldValues },
    });

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error: any) {
    console.error('Delete setting error:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting', details: error.message },
      { status: 500 }
    );
  }
}