import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
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
    const newPassword = (body?.newPassword || '').toString();

    console.log('Reset password request:', { email, codeLength: code.length });

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Find user by email
    const dbUser = await User.findOne({ where: { email } });
    if (!dbUser) {
      console.log('User not found for email:', email);
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
      console.log('No valid code found for user:', dbUser.id);
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Change password in Supabase via Admin API
    const { error: updateError } = await supabaseServer.auth.admin.updateUserById(dbUser.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Supabase update password error:', updateError.message);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    // Mark code as used
    record.usedAt = now;
    await record.save();

    console.log('Password reset successful for user:', dbUser.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('forgot-password reset-password error:', e);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
