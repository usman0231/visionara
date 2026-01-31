import { NextRequest, NextResponse } from 'next/server';
import { Package, AuditLog, AuditAction, PackageCategory, PackageTier } from '@/lib/db/models';
import { updatePackageSchema } from '@/lib/validations/package';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const package_ = await Package.findOne({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!package_) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ package: package_ });
  } catch (error: any) {
    console.error('Get package error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package', details: error.message },
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

    const package_ = await Package.findOne({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!package_) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updatePackageSchema.parse(body);
    const oldValues = package_.toJSON();

    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.category) {
      updateData.category = validatedData.category as PackageCategory;
    }
    if (validatedData.tier) {
      updateData.tier = validatedData.tier as PackageTier;
    }
    await package_.update(updateData);

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.UPDATE,
      entity: 'packages',
      entityId: package_.id,
      diff: { oldValues, newValues: validatedData },
    });

    return NextResponse.json({ package: package_ });
  } catch (error: any) {
    console.error('Update package error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update package', details: error.message },
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

    const package_ = await Package.findOne({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!package_) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const oldValues = package_.toJSON();

    await package_.update({
      deletedAt: new Date(),
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'packages',
      entityId: package_.id,
      diff: { oldValues },
    });

    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error: any) {
    console.error('Delete package error:', error);
    return NextResponse.json(
      { error: 'Failed to delete package', details: error.message },
      { status: 500 }
    );
  }
}
