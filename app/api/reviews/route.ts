import { NextRequest, NextResponse } from 'next/server';
import { Review, AuditLog, AuditAction } from '@/lib/db/models';
import { createReviewSchema } from '@/lib/validations/review';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    const whereCondition: Record<string, unknown> = { deletedAt: null };
    if (published === 'true') {
      whereCondition.active = true;
    }

    const reviews = await Review.findAll({
      where: whereCondition,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    const response = NextResponse.json({ reviews });
    // Cache for 24 hours, can be manually revalidated via /api/admin/revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: message },
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
