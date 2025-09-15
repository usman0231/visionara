import { NextRequest, NextResponse } from 'next/server';
import { GalleryItem, Service, AuditLog } from '@/lib/db/models';
import { createGalleryItemSchema } from '@/lib/validations/gallery';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const category = searchParams.get('category');

    const whereCondition: any = { deletedAt: null };
    if (published === 'true') {
      whereCondition.isPublished = true;
    }
    if (category) {
      whereCondition.category = category;
    }

    const galleryItems = await GalleryItem.findAll({
      where: whereCondition,
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    return NextResponse.json({ galleryItems });
  } catch (error: any) {
    console.error('Get gallery items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items', details: error.message },
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
    const validatedData = createGalleryItemSchema.parse(body);

    // Verify service exists if serviceId provided
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

    const galleryItem = await GalleryItem.create({
      ...validatedData,
      createdBy: userId,
    });

    await AuditLog.create({
      userId,
      action: 'CREATE',
      tableName: 'gallery_items',
      recordId: galleryItem.id,
      newValues: validatedData,
    });

    return NextResponse.json({ galleryItem }, { status: 201 });
  } catch (error: any) {
    console.error('Create gallery item error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create gallery item', details: error.message },
      { status: 500 }
    );
  }
}