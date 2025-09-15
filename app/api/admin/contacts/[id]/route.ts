import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * PUT /api/admin/contacts/[id]
 * Update a contact
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updatedRowsCount] = await ContactSubmission.update(
      {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        serviceType: body.serviceType || null,
        budget: body.budget || null,
        timeline: body.timeline || null,
        message: body.message,
        meta: body.meta || {}
      },
      {
        where: { id }
      }
    );

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const updatedContact = await ContactSubmission.findByPk(id);
    return NextResponse.json(updatedContact);
  } catch (error: any) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/contacts/[id]
 * Delete a contact (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedRowsCount = await ContactSubmission.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact', details: error.message },
      { status: 500 }
    );
  }
}