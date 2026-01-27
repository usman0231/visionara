import { NextRequest, NextResponse } from 'next/server';
import { Project, ProjectImage, Service } from '@/lib/db/models';
import { updateProjectSchema } from '@/lib/validations/project';

export const runtime = 'nodejs';

/**
 * GET /api/admin/projects/[id]
 * Fetch a single project with images
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await Project.findByPk(id, {
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

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/projects/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.serviceId !== undefined) updateData.serviceId = validatedData.serviceId;
    if (validatedData.coverImage !== undefined) updateData.coverImage = validatedData.coverImage;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.active !== undefined) updateData.active = validatedData.active;

    const [updatedRowsCount] = await Project.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const updatedProject = await Project.findByPk(id, {
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

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error('Error updating project:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update project', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete a project (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedRowsCount = await Project.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project', details: error.message },
      { status: 500 }
    );
  }
}
