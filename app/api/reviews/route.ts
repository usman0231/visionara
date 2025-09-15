import { NextRequest, NextResponse } from 'next/server';
import { Review, Service, AuditLog, AuditAction } from '@/lib/db/models';
import { createReviewSchema } from '@/lib/validations/review';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    const whereCondition: any = { deletedAt: null };
    if (published === 'true') {
      whereCondition.isPublished = true;
    }

    const reviews = await Review.findAll({
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

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
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
    const validatedData = createReviewSchema.parse(body);

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

    // @ts-expect-error - Temporary fix for model/validation schema mismatch
    const review = await Review.create({
      ...validatedData,
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.CREATE,
      entity: 'reviews',
      entityId: review.id,
      diff: { newValues: validatedData },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error('Create review error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
}