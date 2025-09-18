import { NextRequest, NextResponse } from 'next/server';
import { FAQ } from '@/lib/db/models';
import { createFAQSchema, faqQuerySchema } from '@/lib/validations/faq';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/faqs
 * Fetch all FAQ items with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {
      category: searchParams.get('category') || undefined,
      active: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Validate query parameters
    const validatedQuery = faqQuerySchema.parse(queryParams);

    const whereClause: any = {
      deletedAt: null
    };

    if (validatedQuery.category) {
      whereClause.category = validatedQuery.category;
    }

    if (validatedQuery.active !== undefined) {
      whereClause.active = validatedQuery.active;
    }

    const faqs = await FAQ.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
    });

    // Get total count for pagination
    const totalCount = await FAQ.count({
      where: whereClause,
    });

    return NextResponse.json({
      faqs,
      pagination: {
        total: totalCount,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch FAQs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/faqs
 * Create a new FAQ item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createFAQSchema.parse(body);

    const newFAQ = await FAQ.create(validatedData);

    return NextResponse.json(newFAQ, { status: 201 });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create FAQ', details: error.message },
      { status: 500 }
    );
  }
}