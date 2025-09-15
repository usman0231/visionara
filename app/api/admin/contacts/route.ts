import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/contacts
 * Fetch all contacts
 */
export async function GET(request: NextRequest) {
  try {
    const contacts = await ContactSubmission.findAll({
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(contacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const contact = await ContactSubmission.create({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      serviceType: body.serviceType || null,
      budget: body.budget || null,
      timeline: body.timeline || null,
      message: body.message,
      meta: body.meta || {}
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact', details: error.message },
      { status: 500 }
    );
  }
}