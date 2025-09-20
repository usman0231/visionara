import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { PasswordResetCode, User } from '@/lib/db/models';
import crypto from 'crypto';

export const runtime = 'nodejs';

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const verificationCode = (body?.verificationCode || '').toString().trim();
    const newPassword = (body?.newPassword || '').toString();

    if (!verificationCode) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Ensure user exists
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const codeHash = hashCode(verificationCode);
    const now = new Date();

    // Find matching, unexpired, unused code
    const record = await PasswordResetCode.findOne({
      where: {
        userId: dbUser.id,
        codeHash,
        usedAt: null,
      } as any,
      order: [['createdAt', 'DESC']],
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }
    if (record.expiresAt.getTime() < now.getTime()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    // Change password in Supabase via Admin API
    const { error: updateError } = await supabaseServer.auth.admin.updateUserById(dbUser.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Supabase update password error:', updateError.message);
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }

    // Mark code as used
    record.usedAt = now;
    await record.save();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('change-with-code error:', e);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
