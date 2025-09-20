import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { User, Role, AuditLog, AuditAction } from '@/lib/db/models';
import { createUserSchema } from '@/lib/validations/user';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: { user: authUser }, error } = await supabaseServer.auth.getUser(token);
    if (error || !authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Validate request data
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user with this email already exists
    const existingUser = await User.findOne({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Verify role exists
    const role = await Role.findByPk(validatedData.roleId);
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Create user in Supabase Auth first
    const { data: createdAuth, error: createAuthErr } = await supabaseServer.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
    });

    if (createAuthErr || !createdAuth?.user) {
      return NextResponse.json(
        { error: createAuthErr?.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    // Create user in database
    let createdUser;
    try {
      createdUser = await User.create({
        id: createdAuth.user.id,
        email: validatedData.email,
        displayName: validatedData.displayName,
        roleId: validatedData.roleId,
      });
    } catch (dbErr: any) {
      // Rollback auth user if DB insert fails
      try {
        await supabaseServer.auth.admin.deleteUser(createdAuth.user.id);
      } catch (rollbackErr) {
        console.error('Failed to rollback auth user:', rollbackErr);
      }

      if (dbErr?.original?.code === '23505') {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      throw dbErr;
    }

    // Get user with role for response
    const userWithRole = await User.findByPk(createdUser.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    // Log the action
    await AuditLog.create({
      actorUserId: authUser.id,
      action: AuditAction.CREATE,
      entity: 'users',
      entityId: createdUser.id,
      diff: {
        newValues: {
          email: validatedData.email,
          displayName: validatedData.displayName,
          roleId: validatedData.roleId
        }
      },
    });

    return NextResponse.json(userWithRole, { status: 201 });

  } catch (error: any) {
    console.error('Create user error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}