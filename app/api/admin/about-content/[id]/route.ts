import { NextRequest, NextResponse } from 'next/server';
import { AboutContent } from '@/lib/db/models';
import { updateAboutContentSchema, validateContentBySection } from '@/lib/validations/aboutContent';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/about-content/[id]
 * Fetch a specific about content block
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await AboutContent.findByPk(id);

    if (!content) {
      return NextResponse.json(
        { error: 'About content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about content', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/about-content/[id]
 * Update a specific about content block
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate schema
    const validatedData = updateAboutContentSchema.parse(body);

    // Find existing content
    const content = await AboutContent.findByPk(id);
    if (!content) {
      return NextResponse.json(
        { error: 'About content not found' },
        { status: 404 }
      );
    }

    // If content is being updated, validate it based on section type
    if (validatedData.content) {
      const section = validatedData.section || content.section;
      try {
        validateContentBySection(section, validatedData.content);
      } catch (contentError: any) {
        return NextResponse.json(
          { error: 'Invalid content for section', details: contentError.message },
          { status: 400 }
        );
      }
    }

    // Update the content
    await content.update(validatedData as any);

    // Fetch updated content
    const updatedContent = await AboutContent.findByPk(id);

    return NextResponse.json(updatedContent);
  } catch (error: any) {
    console.error('Error updating about content:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update about content', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/about-content/[id]
 * Delete a specific about content block (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await AboutContent.findByPk(id);

    if (!content) {
      return NextResponse.json(
        { error: 'About content not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await content.destroy();

    return NextResponse.json(
      { message: 'About content deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting about content:', error);
    return NextResponse.json(
      { error: 'Failed to delete about content', details: error.message },
      { status: 500 }
    );
  }
}