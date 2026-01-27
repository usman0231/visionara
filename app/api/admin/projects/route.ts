import { NextRequest, NextResponse } from 'next/server';
import { Project, ProjectImage, Service } from '@/lib/db/models';
import { createProjectSchema } from '@/lib/validations/project';

export const runtime = 'nodejs';

/**
 * GET /api/admin/projects
 * Fetch all projects with optional service filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    const whereClause: Record<string, unknown> = {
      deletedAt: null
    };

    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    const projects = await Project.findAll({
      where: whereClause,
      order: [['priority', 'ASC'], ['createdAt', 'DESC']],
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
          separate: true,
          order: [['sortOrder', 'ASC']],
        },
      ],
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const project = await Project.create({
      title: validatedData.title,
      description: validatedData.description || null,
      serviceId: validatedData.serviceId || null,
      coverImage: validatedData.coverImage,
      priority: validatedData.priority || 0,
      active: validatedData.active !== undefined ? validatedData.active : true,
    });

    // Fetch with associations
    const projectWithAssociations = await Project.findByPk(project.id, {
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
        },
      ],
    });

    return NextResponse.json(projectWithAssociations, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
}
