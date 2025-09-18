import { NextRequest, NextResponse } from 'next/server';
import { FAQ } from '@/lib/db/models';
import { updateFAQSchema } from '@/lib/validations/faq';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/faqs/[id]
 * Fetch a specific FAQ item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error: any) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/faqs/[id]
 * Update a specific FAQ item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateFAQSchema.parse(body);

    // Find existing FAQ
    const faq = await FAQ.findByPk(id);
    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Update the FAQ
    await faq.update(validatedData);

    // Fetch updated FAQ
    const updatedFAQ = await FAQ.findByPk(id);

    return NextResponse.json(updatedFAQ);
  } catch (error: any) {
    console.error('Error updating FAQ:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update FAQ', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/faqs/[id]
 * Delete a specific FAQ item (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await faq.destroy();

    return NextResponse.json(
      { message: 'FAQ deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ', details: error.message },
      { status: 500 }
    );
  }
}