import { NextRequest, NextResponse } from 'next/server';
import { Review } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/reviews
 * Fetch all reviews
 */
export async function GET(request: NextRequest) {
  try {
    const reviews = await Review.findAll({
      where: {
        deletedAt: null
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reviews
 * Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const review = await Review.create({
      name: body.name,
      role: body.role || null,
      rating: body.rating,
      text: body.text,
      active: body.active !== undefined ? body.active : true,
      sortOrder: body.sortOrder || 0
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
}