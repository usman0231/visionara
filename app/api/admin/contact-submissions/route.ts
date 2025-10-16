import { NextRequest, NextResponse } from 'next/server';
import { ContactSubmission } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const submissions = await ContactSubmission.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Get contact submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions', details: error.message },
      { status: 500 }
    );
  }
}
