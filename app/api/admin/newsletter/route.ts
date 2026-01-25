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
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status && (status === 'subscribed' || status === 'unsubscribed')) {
      where.status = status;
    }

    if (search) {
      where.email = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const subscriptions = await NewsletterSubscription.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error('Get newsletter subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter subscriptions', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    const subscription = await NewsletterSubscription.findByPk(id);

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    await subscription.destroy();

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error: any) {
    console.error('Delete newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter subscription', details: error.message },
      { status: 500 }
    );
  }
}
