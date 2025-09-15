import { NextRequest, NextResponse } from 'next/server';
import { Service, AuditLog } from '@/lib/db/models';
import { createServiceSchema, updateServiceSchema } from '@/lib/validations/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const services = await Service.findAll({
      where: { deletedAt: null },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error.message },
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
    const validatedData = createServiceSchema.parse(body);

    const service = await Service.create({
      ...validatedData,
    });

    await AuditLog.create({
      userId,
      action: 'CREATE',
      tableName: 'services',
      recordId: service.id,
      newValues: validatedData,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: any) {
    console.error('Create service error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create service', details: error.message },
      { status: 500 }
    );
  }
}