import { NextRequest, NextResponse } from 'next/server';
import { Package, AuditLog, AuditAction, PackageCategory, PackageTier } from '@/lib/db/models';
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

    const response = NextResponse.json(packages);
    // Cache for 24 hours, can be manually revalidated via /api/admin/revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: message },
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

    const package_ = await Package.create({
      ...validatedData,
      category: validatedData.category as PackageCategory,
      tier: validatedData.tier as PackageTier,
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
