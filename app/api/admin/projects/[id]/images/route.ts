import { NextRequest, NextResponse } from 'next/server';
import { ProjectImage, Project } from '@/lib/db/models';

export const runtime = 'nodejs';

/**
 * GET /api/admin/projects/[id]/images
 * Get all images for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const images = await ProjectImage.findAll({
      where: { projectId: id },
      order: [['sortOrder', 'ASC']],
    });

    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Error fetching project images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project images', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/projects/[id]/images
 * Add a new image to a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify project exists
    const project = await Project.findByPk(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const image = await ProjectImage.create({
      projectId: id,
      imageUrl: body.imageUrl,
      alt: body.alt || 'Project image',
      sortOrder: body.sortOrder || 0,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error: any) {
    console.error('Error adding project image:', error);
    return NextResponse.json(
      { error: 'Failed to add project image', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/projects/[id]/images
 * Bulk update images (for reordering)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }

    // Update each image's sort order
    await Promise.all(
      images.map((img: { id: string; sortOrder: number }, index: number) =>
        ProjectImage.update(
          { sortOrder: img.sortOrder ?? index },
          { where: { id: img.id, projectId: id } }
        )
      )
    );

    const updatedImages = await ProjectImage.findAll({
      where: { projectId: id },
      order: [['sortOrder', 'ASC']],
    });

    return NextResponse.json(updatedImages);
  } catch (error: any) {
    console.error('Error updating project images:', error);
    return NextResponse.json(
      { error: 'Failed to update project images', details: error.message },
      { status: 500 }
    );
  }
}
