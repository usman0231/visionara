import { NextRequest, NextResponse } from 'next/server';
import { User, Role, AuditLog, AuditAction } from '@/lib/db/models';
import { createUserSchema } from '@/lib/validations/user';
import { v4 as uuidv4 } from 'uuid';

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
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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

    // Note: In a real implementation, you'd typically create the user in Supabase Auth first
    // and use the returned user ID. For this demo, we'll generate a UUID.
    const user = await User.create({
      id: uuidv4(), // In practice, this would come from Supabase Auth
      ...validatedData,
    });

    // Include role information in response
    const userWithRole = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    await AuditLog.create({
      actorUserId: userId,
      action: AuditAction.CREATE,
      entity: 'users',
      entityId: user.id,
      diff: { newValues: validatedData },
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