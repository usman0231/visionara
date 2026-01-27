import { NextRequest, NextResponse } from 'next/server';
import { ProjectImage } from '@/lib/db/models';

export const runtime = 'nodejs';

/**
 * PUT /api/admin/project-images/[imageId]
 * Update a single project image
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.alt !== undefined) updateData.alt = body.alt;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    const [updatedRowsCount] = await ProjectImage.update(updateData, {
      where: { id: imageId }
    });

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Project image not found' },
        { status: 404 }
      );
    }

    const updatedImage = await ProjectImage.findByPk(imageId);
    return NextResponse.json(updatedImage);
  } catch (error: any) {
    console.error('Error updating project image:', error);
    return NextResponse.json(
      { error: 'Failed to update project image', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/project-images/[imageId]
 * Delete a project image
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;

    const deletedRowsCount = await ProjectImage.destroy({
      where: { id: imageId }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Project image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Project image deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project image:', error);
    return NextResponse.json(
      { error: 'Failed to delete project image', details: error.message },
      { status: 500 }
    );
  }
}
