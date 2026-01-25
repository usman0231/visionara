import { NextRequest, NextResponse } from 'next/server';
import { NewsletterSubscription } from '@/lib/db/models/newsletterSubscription';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type NewsletterSubscribeData = {
  email?: string;
};

function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NewsletterSubscribeData;

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { message: 'Email is required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Normalize email (lowercase)
    const normalizedEmail = body.email.toLowerCase().trim();

    // Check if email already exists
    const existingSubscription = await NewsletterSubscription.findOne({
      where: { email: normalizedEmail },
    });

    if (existingSubscription) {
      // If already subscribed, return success message
      if (existingSubscription.status === 'subscribed') {
        return NextResponse.json(
          { message: 'This email is already subscribed to our newsletter.' },
          { status: 200 }
        );
      }

      // If previously unsubscribed, resubscribe
      if (existingSubscription.status === 'unsubscribed') {
        await existingSubscription.update({
          status: 'subscribed',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get('user-agent'),
        });

        return NextResponse.json(
          { message: 'Welcome back! You have been resubscribed to our newsletter.' },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    await NewsletterSubscription.create({
      email: normalizedEmail,
      status: 'subscribed',
      subscribedAt: new Date(),
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
    });

    return NextResponse.json(
      { message: 'Thanks for subscribing! You will receive our latest updates.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('NEWSLETTER_SUBSCRIBE_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
