import { NextRequest, NextResponse } from 'next/server';
import { GalleryItem, Service, AuditLog, AuditAction } from '@/lib/db/models';
import { updateGalleryItemSchema } from '@/lib/validations/gallery';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const galleryItem = await GalleryItem.findOne({
      where: {
        id,
        deletedAt: null 
      },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    });

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ galleryItem });
  } catch (error: any) {
    console.error('Get gallery item error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery item', details: error.message },
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

    const galleryItem = await GalleryItem.findOne({
      where: {
        id,
        deletedAt: null 
      },
    });

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateGalleryItemSchema.parse(body);
    const oldValues = galleryItem.toJSON();

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

    await galleryItem.update({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.UPDATE,
      entity: 'gallery_items',
      entityId: galleryItem.id,
      diff: { oldValues, newValues: validatedData },
    });

    return NextResponse.json({ galleryItem });
  } catch (error: any) {
    console.error('Update gallery item error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update gallery item', details: error.message },
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

    const galleryItem = await GalleryItem.findOne({
      where: {
        id,
        deletedAt: null 
      },
    });

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    const oldValues = galleryItem.toJSON();

    await galleryItem.update({
      deletedAt: new Date(),
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'gallery_items',
      entityId: galleryItem.id,
      diff: { oldValues },
    });

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    console.error('Delete gallery item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item', details: error.message },
      { status: 500 }
    );
  }
}