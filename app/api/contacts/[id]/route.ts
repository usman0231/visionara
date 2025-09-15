import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission, AuditLog } from '@/lib/db/models';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateContactSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved']),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await ContactSubmission.findByPk(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const contact = await ContactSubmission.findByPk(params.id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateContactSchema.parse(body);
    const oldValues = contact.toJSON();

    await contact.update({
      ...validatedData,
      updatedBy: userId,
    });

    await AuditLog.create({
      userId,
      action: 'UPDATE',
      tableName: 'contact_submissions',
      recordId: contact.id,
      oldValues,
      newValues: validatedData,
    });

    return NextResponse.json({ contact });
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const contact = await ContactSubmission.findByPk(params.id);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const oldValues = contact.toJSON();

    await contact.destroy();

    await AuditLog.create({
      userId,
      action: 'DELETE',
      tableName: 'contact_submissions',
      recordId: contact.id,
      oldValues,
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