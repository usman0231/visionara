import { NextRequest, NextResponse } from 'next/server';
import { Package, Service, AuditLog } from '@/lib/db/models';
import { updatePackageSchema } from '@/lib/validations/package';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const package_ = await Package.findOne({
      where: { 
        id: params.id,
        deletedAt: null 
      },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name'],
        },
      ],
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const package_ = await Package.findOne({
      where: { 
        id: params.id,
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

    // Verify service exists if serviceId is being updated
    if (validatedData.serviceId) {
      const service = await Service.findOne({
        where: { id: validatedData.serviceId, deletedAt: null },
      });

      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
    }

    await package_.update({
      ...validatedData,
      updatedBy: userId,
    });

    await AuditLog.create({
      userId,
      action: 'UPDATE',
      tableName: 'packages',
      recordId: package_.id,
      oldValues,
      newValues: validatedData,
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const package_ = await Package.findOne({
      where: { 
        id: params.id,
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
      updatedBy: userId,
    });

    await AuditLog.create({
      userId,
      action: 'DELETE',
      tableName: 'packages',
      recordId: package_.id,
      oldValues,
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