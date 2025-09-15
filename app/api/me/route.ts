import { NextRequest, NextResponse } from 'next/server';
import { supabaseAuth } from '@/lib/supabase/server';
import { User, Role } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database with role
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: ['id', 'email', 'displayName', 'roleId', 'createdAt'],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role?.name || 'Unknown',
        permissions: user.role?.permissions || {},
        createdAt: user.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Get user info error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}