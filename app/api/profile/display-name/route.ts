import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { User, Role } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
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
    const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name cannot be empty' },
        { status: 400 }
      );
    }

    if (displayName.length > 100) {
      return NextResponse.json(
        { error: 'Display name cannot exceed 100 characters' },
        { status: 400 }
      );
    }

    // Update user in database
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    await dbUser.update({ displayName });

    // Return updated user info
    const updatedUser = await User.findByPk(user.id, {
      attributes: ['id', 'email', 'displayName', 'roleId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    return NextResponse.json({
      id: updatedUser!.id,
      email: updatedUser!.email,
      displayName: updatedUser!.displayName,
      roleId: updatedUser!.roleId,
      role: updatedUser!.role,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    });

  } catch (error: any) {
    console.error('Update display name error:', error);
    return NextResponse.json(
      { error: 'Failed to update display name', details: error.message },
      { status: 500 }
    );
  }
}