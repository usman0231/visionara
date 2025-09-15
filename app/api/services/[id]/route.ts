import { NextRequest, NextResponse } from 'next/server';
import { Service, AuditLog } from '@/lib/db/models';
import { updateServiceSchema } from '@/lib/validations/service';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await Service.findOne({
      where: { 
        id: params.id,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const service = await Service.findOne({
      where: { 
        id: params.id,
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
      userId,
      action: 'UPDATE',
      tableName: 'services',
      recordId: service.id,
      oldValues,
      newValues: validatedData,
    });

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const service = await Service.findOne({
      where: { 
        id: params.id,
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

    await service.update({
      deletedAt: new Date(),
    });

    await AuditLog.create({
      userId,
      action: 'DELETE',
      tableName: 'services',
      recordId: service.id,
      oldValues,
    });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service', details: error.message },
      { status: 500 }
    );
  }
}