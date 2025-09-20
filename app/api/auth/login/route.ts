import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { User, Role, AuditLog, AuditAction, RoleName } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the token with Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    
    if (error || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user exists in our database
    let dbUser = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!dbUser) {
      // User doesn't exist in our database - they need to be created by an admin
      return NextResponse.json(
        {
          error: 'Account not found. Please contact an administrator to create your account.',
          code: 'USER_NOT_FOUND'
        },
        { status: 403 }
      );
    }

    // Log the login action
    await AuditLog.create({
      actorUserId: userId,
      entity: 'auth',
      entityId: userId,
      action: AuditAction.LOGIN,
      diff: {
        email,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: dbUser!.id,
        email: dbUser!.email,
        displayName: dbUser!.displayName,
        role: dbUser!.role?.name || 'Unknown',
        permissions: dbUser!.role?.permissions || {},
      },
    });

  } catch (error: any) {
    console.error('Login API error:', error);
    
    return NextResponse.json(
      { error: 'Login processing failed', details: error.message },
      { status: 500 }
    );
  }
}