import { NextRequest, NextResponse } from 'next/server';
import { NewsletterSubscription } from '@/lib/db/models/newsletterSubscription';
import { Op } from 'sequelize';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};

    if (status && (status === 'subscribed' || status === 'unsubscribed')) {
      where.status = status;
    }

    const subscriptions = await NewsletterSubscription.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    // Convert to CSV
    const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At', 'IP Address'];
    const csvRows = [headers.join(',')];

    subscriptions.forEach((sub: any) => {
      const row = [
        sub.email,
        sub.status,
        new Date(sub.subscribedAt).toISOString(),
        sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toISOString() : '',
        sub.ipAddress || '',
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export newsletter subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to export newsletter subscriptions', details: error.message },
      { status: 500 }
    );
  }
}
