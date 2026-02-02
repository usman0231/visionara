import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetCode, User } from '@/lib/db/models';
import { Op } from 'sequelize';
import crypto from 'crypto';

export const runtime = 'nodejs';

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const code = (body?.code || '').toString().trim();

    console.log('Verify code request:', { email, codeLength: code.length });

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    // Find user by email
    const dbUser = await User.findOne({ where: { email } });
    if (!dbUser) {
      console.log('User not found for email:', email);
      return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
    }

    const codeHash = hashCode(code);
    const now = new Date();

    // Find matching, unexpired, unused code
    const record = await PasswordResetCode.findOne({
      where: {
        userId: dbUser.id,
        codeHash,
        usedAt: null,
        expiresAt: { [Op.gt]: now },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!record) {
      // Check if there's any code for this user to give better error message
      const anyCode = await PasswordResetCode.findOne({
        where: { userId: dbUser.id },
        order: [['createdAt', 'DESC']],
      });

      if (!anyCode) {
        console.log('No reset code found for user:', dbUser.id);
        return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
      }

      if (anyCode.usedAt) {
        console.log('Code already used:', anyCode.id);
        return NextResponse.json({ error: 'This code has already been used. Please request a new one.' }, { status: 400 });
      }

      if (anyCode.expiresAt.getTime() < now.getTime()) {
        console.log('Code expired:', anyCode.id);
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
      }

      console.log('Code hash mismatch for user:', dbUser.id);
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    console.log('Code verified successfully for user:', dbUser.id);
    // Code is valid - don't mark as used yet, just verify it exists
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('forgot-password verify-code error:', e);
    return NextResponse.json({ error: 'Failed to verify code. Please try again.' }, { status: 500 });
  }
}
