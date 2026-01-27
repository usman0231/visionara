import { NextRequest, NextResponse } from 'next/server';
import { Service, AuditLog, AuditAction } from '@/lib/db/models';
import { createServiceSchema, updateServiceSchema } from '@/lib/validations/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const services = await Service.findAll({
      where: { deletedAt: null, active: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    const response = NextResponse.json({ services });
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch services', details: message },
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

    // @ts-expect-error - Temporary fix for model/validation schema mismatch
    const service = await Service.create({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.CREATE,
      entity: 'services',
      entityId: service.id,
      diff: { newValues: validatedData },
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