import { NextRequest, NextResponse } from 'next/server';
import { AboutContent } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/about-content
 * Public endpoint to fetch active about content for the frontend
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const whereClause: any = {
      active: true,
      deletedAt: null
    };

    if (section) {
      whereClause.section = section;
    }

    const content = await AboutContent.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      attributes: ['id', 'section', 'title', 'subtitle', 'content', 'sortOrder'], // Exclude timestamps for public API
    });

    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    );
  }
}