import { NextRequest, NextResponse } from 'next/server';
import { Setting } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * PUT /api/admin/settings/[id]
 * Update a setting
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updatedRowsCount] = await Setting.update(
      {
        key: body.key,
        value: body.value
      },
      {
        where: { id }
      }
    );

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    const updatedSetting = await Setting.findByPk(id);
    return NextResponse.json(updatedSetting);
  } catch (error: any) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/settings/[id]
 * Delete a setting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedRowsCount = await Setting.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting', details: error.message },
      { status: 500 }
    );
  }
}