import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission, AuditLog, AuditAction } from '@/lib/db/models';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateContactSchema = z.object({
  // Contact submissions are read-only, no fields can be updated
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await ContactSubmission.findByPk(id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('Get contact error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const contact = await ContactSubmission.findByPk(id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Contact submissions are read-only
    return NextResponse.json(
      { error: 'Contact submissions cannot be updated' },
      { status: 405 }
    );
  } catch (error: any) {
    console.error('Update contact error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update contact', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const contact = await ContactSubmission.findByPk(id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const oldValues = contact.toJSON();

    await contact.destroy();

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.DELETE,
      entity: 'contact_submissions',
      entityId: contact.id,
      diff: { oldValues },
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact', details: error.message },
      { status: 500 }
    );
  }
}