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

    // Get or create user in our database
    let dbUser = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!dbUser) {
      // Get default Viewer role
      const viewerRole = await Role.findOne({
        where: { name: RoleName.VIEWER }
      });

      if (!viewerRole) {
        throw new Error('Default Viewer role not found. Database may not be properly seeded.');
      }

      // Create new user with Viewer role
      dbUser = await User.create({
        id: userId,
        email,
        displayName: user.user_metadata?.display_name || null,
        roleId: viewerRole.id,
      }, {
        include: [{ model: Role, as: 'role' }]
      });

      // Reload to get the role
      dbUser = await User.findByPk(userId, {
        include: [{ model: Role, as: 'role' }]
      });
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