import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { User, Role } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Validate auth via Authorization header or Supabase cookie
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

    // Get user from database
    const dbUser = await User.findByPk(user.id, {
      attributes: ['id', 'email', 'displayName', 'roleId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!dbUser) {
      // User not found in database - clear invalid session
      const cookieStore = await cookies();
      cookieStore.delete('sb-access-token');
      cookieStore.delete('sb-refresh-token');

      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user info
    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      roleId: dbUser.roleId,
      role: dbUser.role || null,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    });

  } catch (error: any) {
    console.error('Get user info error:', error);

    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
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
    const displayNameRaw = typeof body?.displayName === 'string' ? body.displayName : '';
    const displayName = displayNameRaw.trim();

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name cannot be empty' },
        { status: 400 }
      );
    }

    const dbUser = await User.findByPk(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    dbUser.displayName = displayName;
    await dbUser.save();

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}