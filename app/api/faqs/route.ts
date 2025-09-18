import { NextRequest, NextResponse } from 'next/server';
import { FAQ } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/faqs
 * Public endpoint to fetch active FAQ items for the frontend
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const whereClause: any = {
      active: true,
      deletedAt: null
    };

    if (category) {
      whereClause.category = category;
    }

    const faqs = await FAQ.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      attributes: ['id', 'question', 'answer', 'category'], // Exclude timestamps and admin fields for public API
    });

    return NextResponse.json(faqs);
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}