import { NextRequest, NextResponse } from 'next/server';
import { GalleryItem } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/gallery/[id]
 * Fetch a single gallery item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await GalleryItem.findByPk(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery item', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/gallery/[id]
 * Update a gallery item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updatedRowsCount] = await GalleryItem.update(
      {
        imageUrl: body.imageUrl,
        alt: body.alt,
        active: body.active !== undefined ? body.active : true,
        sortOrder: body.sortOrder || 0
      },
      {
        where: { id }
      }
    );

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    const updatedItem = await GalleryItem.findByPk(id);
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery item', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/gallery/[id]
 * Delete a gallery item (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedRowsCount = await GalleryItem.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item', details: error.message },
      { status: 500 }
    );
  }
}