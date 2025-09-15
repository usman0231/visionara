import { NextRequest, NextResponse } from 'next/server';
import { Setting, AuditLog } from '@/lib/db/models';
import { createSettingSchema } from '@/lib/validations/setting';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public');

    const whereCondition: any = {};
    if (category) {
      whereCondition.category = category;
    }
    if (isPublic === 'true') {
      whereCondition.isPublic = true;
    }

    const settings = await Setting.findAll({
      where: whereCondition,
      order: [['category', 'ASC'], ['key', 'ASC']],
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

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSettingSchema.parse(body);

    // Check if setting with this key already exists
    const existingSetting = await Setting.findOne({
      where: { key: validatedData.key },
    });

    if (existingSetting) {
      return NextResponse.json(
        { error: 'Setting with this key already exists' },
        { status: 400 }
      );
    }

    const setting = await Setting.create({
      ...validatedData,
      createdBy: userId,
    });

    await AuditLog.create({
      userId,
      action: 'CREATE',
      tableName: 'settings',
      recordId: setting.id,
      newValues: validatedData,
    });

    return NextResponse.json({ setting }, { status: 201 });
  } catch (error: any) {
    console.error('Create setting error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create setting', details: error.message },
      { status: 500 }
    );
  }
}