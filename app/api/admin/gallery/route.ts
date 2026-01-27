import { NextRequest, NextResponse } from 'next/server';
import { GalleryItem, Service } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/gallery
 * Fetch all gallery items with optional service filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    const whereClause: Record<string, unknown> = { deletedAt: null };
    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    const items = await GalleryItem.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title'],
        },
      ],
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

    // Validate required fields
    const imageUrl = body.imageUrl?.trim();
    const alt = body.alt?.trim();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!alt) {
      return NextResponse.json(
        { error: 'Alt text is required' },
        { status: 400 }
      );
    }

    // Handle serviceId - convert empty string to null
    const serviceId = body.serviceId && body.serviceId.trim() !== '' ? body.serviceId : null;

    const item = await GalleryItem.create({
      imageUrl,
      alt,
      serviceId,
      active: body.active !== undefined ? body.active : true,
      sortOrder: body.sortOrder || 0
    });

    // Fetch with service info
    const itemWithService = await GalleryItem.findByPk(item.id, {
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title'],
        },
      ],
    });

    return NextResponse.json(itemWithService, { status: 201 });
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item', details: error.message },
      { status: 500 }
    );
  }
}