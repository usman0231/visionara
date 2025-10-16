import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const submission = await ContactSubmission.findByPk(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('Get contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact submission', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'replied', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const submission = await ContactSubmission.findByPk(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    await submission.update({ status });

    return NextResponse.json({ message: 'Status updated successfully', submission });
  } catch (error: any) {
    console.error('Update contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact submission', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const submission = await ContactSubmission.findByPk(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    await submission.destroy();

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact submission', details: error.message },
      { status: 500 }
    );
  }
}
