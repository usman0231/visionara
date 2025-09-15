import { NextRequest, NextResponse } from 'next/server';
import { GalleryItem } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/gallery
 * Fetch all gallery items
 */
export async function GET(request: NextRequest) {
  try {
    const items = await GalleryItem.findAll({
      where: {
        deletedAt: null
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/gallery
 * Create a new gallery item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const item = await GalleryItem.create({
      imageUrl: body.imageUrl,
      alt: body.alt,
      active: body.active !== undefined ? body.active : true,
      sortOrder: body.sortOrder || 0
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item', details: error.message },
      { status: 500 }
    );
  }
}