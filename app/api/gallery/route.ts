import { NextRequest, NextResponse } from 'next/server';
import { GalleryItem, AuditLog, AuditAction } from '@/lib/db/models';
import { createGalleryItemSchema } from '@/lib/validations/gallery';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const galleryItems = await GalleryItem.findAll({
      where: { active: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
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

    const galleryItem = await GalleryItem.create({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.CREATE,
      entity: 'gallery_items',
      entityId: galleryItem.id,
      diff: { newValues: validatedData },
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