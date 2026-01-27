import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Op } from 'sequelize';
import { supabaseServer } from '@/lib/supabase/server';
import { User, Role, AuditLog, AuditAction } from '@/lib/db/models';
import { updateUserSchema } from '@/lib/validations/user';

export const runtime = 'nodejs';

/**
 * GET /api/admin/users/[id]
 * Fetch a single user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Optional: enforce admin auth here if needed
    const { id } = await params;
    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
    const cookieStore = await cookies();
    const token = bearer || cookieStore.get('sb-access-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { data: { user: actor }, error } = await supabaseServer.auth.getUser(token);
    if (error || !actor) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    const { password, ...dbFields } = validatedData as any;

    // Check if user exists
    const existingUser = await User.findByPk(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If email is being updated, check it's not already taken by another user
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await User.findOne({
        where: {
          email: validatedData.email,
          id: { [Op.ne]: id } // Exclude current user
        }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // If role is being updated, verify it exists
    if (validatedData.roleId) {
      const role = await Role.findByPk(validatedData.roleId);
      if (!role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }
    }

    // Store old values for audit log
    const oldValues = {
      email: existingUser.email,
      displayName: existingUser.displayName,
      roleId: existingUser.roleId,
    };

    // Update user
    const [updatedRowsCount] = await User.update(dbFields, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If password provided, update in Supabase Auth
    if (password && typeof password === 'string' && password.length >= 8) {
      const { error: pwdErr } = await supabaseServer.auth.admin.updateUserById(id, { password });
      if (pwdErr) {
        console.warn('Failed to update user password in Supabase:', pwdErr.message);
      }
    }

    // Fetch updated user with role
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    // Create audit log
    await AuditLog.create({
      actorUserId: actor.id,
      action: AuditAction.UPDATE,
      entity: 'users',
      entityId: id,
      diff: { oldValues, newValues: validatedData },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
    const cookieStore = await cookies();
    const token = bearer || cookieStore.get('sb-access-token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { data: { user: actor }, error } = await supabaseServer.auth.getUser(token);
    if (error || !actor) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Prevent self-deletion
    if (id === actor.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findByPk(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Store user data for audit log before deletion
    const userDataForAudit = {
      email: existingUser.email,
      displayName: existingUser.displayName,
      roleId: existingUser.roleId,
    };

    // Hard delete the user from database
    const deletedRowsCount = await User.destroy({
      where: { id },
      force: true // Force hard delete
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user from Supabase Auth as well
    try {
      await supabaseServer.auth.admin.deleteUser(id);
    } catch (authDeleteError) {
      console.warn('Failed to delete user from Supabase Auth:', authDeleteError);
      // Continue - database deletion succeeded, auth deletion failed but not critical
    }

    // Create audit log
    await AuditLog.create({
      actorUserId: actor.id,
      action: AuditAction.DELETE,
      entity: 'users',
      entityId: id,
      diff: { oldValues: userDataForAudit },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
