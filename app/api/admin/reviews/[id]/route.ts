import { NextRequest, NextResponse } from 'next/server';
import { Review } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * PUT /api/admin/reviews/[id]
 * Update a review
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updatedRowsCount] = await Review.update(
      {
        name: body.name,
        role: body.role || null,
        rating: body.rating,
        text: body.text,
        active: body.active !== undefined ? body.active : true,
        sortOrder: body.sortOrder || 0
      },
      {
        where: { id }
      }
    );

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const updatedReview = await Review.findByPk(id);
    return NextResponse.json(updatedReview);
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete a review (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedRowsCount = await Review.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review', details: error.message },
      { status: 500 }
    );
  }
}