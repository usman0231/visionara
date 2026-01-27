import { NextRequest, NextResponse } from 'next/server';
import { Project, ProjectImage, Service } from '@/lib/db/models';

export const runtime = 'nodejs';

/**
 * GET /api/projects
 * Fetch active projects with optional service filter
 * Returns max 8 projects per category, sorted by priority
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const limit = parseInt(searchParams.get('limit') || '8');

    const whereClause: Record<string, unknown> = {
      active: true,
      deletedAt: null
    };

    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    const projects = await Project.findAll({
      where: whereClause,
      order: [['priority', 'ASC'], ['createdAt', 'DESC']],
      limit: Math.min(limit, 20), // Max 20 to prevent abuse
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title'],
        },
        {
          model: ProjectImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'alt', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
      ],
    });

    const response = NextResponse.json({ projects });
    // Cache for 24 hours, can be manually revalidated via /api/admin/revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: message },
      { status: 500 }
    );
  }
}
