import { NextRequest, NextResponse } from 'next/server';
import { Package, Service, AuditLog, AuditAction } from '@/lib/db/models';
import { createPackageSchema } from '@/lib/validations/package';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const packages = await Package.findAll({
      where: {
        deletedAt: null,
        active: true
      },
      order: [['sortOrder', 'ASC'], ['category', 'ASC'], ['tier', 'ASC']],
      attributes: ['id', 'category', 'tier', 'priceOnetime', 'priceMonthly', 'priceYearly', 'features', 'sortOrder']
    });

    return NextResponse.json(packages);
  } catch (error: any) {
    console.error('Get packages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: error.message },
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
    const validatedData = createPackageSchema.parse(body);

    // Verify service exists
    const service = await Service.findOne({
      where: { id: validatedData.serviceId, deletedAt: null },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // @ts-expect-error - Temporary fix for model/validation schema mismatch
    const package_ = await Package.create({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.CREATE,
      entity: 'packages',
      entityId: package_.id,
      diff: { newValues: validatedData },
    });

    return NextResponse.json({ package: package_ }, { status: 201 });
  } catch (error: any) {
    console.error('Create package error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create package', details: error.message },
      { status: 500 }
    );
  }
}