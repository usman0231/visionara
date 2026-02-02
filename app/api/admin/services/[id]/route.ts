import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Service, AuditLog, AuditAction } from '@/lib/db/models';
import { updateServiceSchema } from '@/lib/validations/service';

export const runtime = 'nodejs';

/**
 * GET /api/admin/services/[id]
 * Fetch a single service by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await Service.findOne({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Get service error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/services/[id]
 * Update a service
 */
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

    const service = await Service.findOne({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);
    const oldValues = service.toJSON();

    await service.update({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.UPDATE,
      entity: 'services',
      entityId: service.id,
      diff: { oldValues, newValues: validatedData },
    });

    revalidatePath('/');
    revalidatePath('/services');

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Update service error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update service', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/services/[id]
 * Soft delete a service
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('DELETE service request for id:', id);

    const userId = request.headers.get('x-user-id');
    console.log('User ID from header:', userId);

    if (!userId) {
      console.log('No user ID found in headers');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const service = await Service.findOne({
      where: {
        id,
        deletedAt: null
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const oldValues = service.toJSON();

    // Use destroy() for paranoid models - this sets deletedAt automatically
    await service.destroy();

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'services',
      entityId: service.id,
      diff: { oldValues },
    });

    revalidatePath('/');
    revalidatePath('/services');

    console.log('Service deleted successfully:', id);
    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service', details: error.message },
      { status: 500 }
    );
  }
}
