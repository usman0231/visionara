import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { User, PasswordResetCode } from '@/lib/db/models';
import { Op } from 'sequelize';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    const cookieStore = await cookies();
    const token = bearer || cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { verificationCode, newPassword } = body;

    // Validate input
    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Hash the provided verification code
    const providedCodeHash = crypto.createHash('sha256').update(verificationCode).digest('hex');

    // Find valid verification code
    const resetCode = await PasswordResetCode.findOne({
      where: {
        userId: user.id,
        codeHash: providedCodeHash,
        expiresAt: {
          [Op.gt]: new Date()
        },
        usedAt: null
      },
      order: [['createdAt', 'DESC']]
    });

    if (!resetCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      // Update password in Supabase Auth
      const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Supabase password update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        );
      }

      // Mark the verification code as used
      await resetCode.update({ usedAt: new Date() });

      // Invalidate all other unused codes for this user
      await PasswordResetCode.update(
        { usedAt: new Date() },
        {
          where: {
            userId: user.id,
            usedAt: null,
            id: { [Op.ne]: resetCode.id }
          }
        }
      );

      return NextResponse.json({
        message: 'Password updated successfully'
      });

    } catch (supabaseError: any) {
      console.error('Password update error:', supabaseError);
      return NextResponse.json(
        { error: 'Failed to update password in authentication system' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password', details: error.message },
      { status: 500 }
    );
  }
}