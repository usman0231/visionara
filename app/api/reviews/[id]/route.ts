import { NextRequest, NextResponse } from 'next/server';
import { Review, Service, AuditLog, AuditAction } from '@/lib/db/models';
import { updateReviewSchema } from '@/lib/validations/review';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await Review.findOne({
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

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Get review error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review', details: error.message },
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

    const review = await Review.findOne({
      where: {
        id,
        deletedAt: null 
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateReviewSchema.parse(body);
    const oldValues = review.toJSON();

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

    await review.update({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.UPDATE,
      entity: 'reviews',
      entityId: review.id,
      diff: { oldValues, newValues: validatedData },
    });

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Update review error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update review', details: error.message },
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

    const review = await Review.findOne({
      where: {
        id,
        deletedAt: null 
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const oldValues = review.toJSON();

    await review.update({
      deletedAt: new Date(),
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'reviews',
      entityId: review.id,
      diff: { oldValues },
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review', details: error.message },
      { status: 500 }
    );
  }
}