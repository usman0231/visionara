import { NextRequest, NextResponse } from 'next/server';
import { Stat } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * PUT /api/admin/stats/[id]
 * Update a stat
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updatedRowsCount] = await Stat.update(
      {
        label: body.label,
        value: body.value,
        prefix: body.prefix || null,
        suffix: body.suffix || null,
        active: body.active !== undefined ? body.active : true,
        sortOrder: body.sortOrder || 0
      },
      {
        where: { id }
      }
    );

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Stat not found' },
        { status: 404 }
      );
    }

    const updatedStat = await Stat.findByPk(id);
    return NextResponse.json(updatedStat);
  } catch (error: any) {
    console.error('Error updating stat:', error);
    return NextResponse.json(
      { error: 'Failed to update stat', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/stats/[id]
 * Delete a stat (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedRowsCount = await Stat.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Stat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Stat deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting stat:', error);
    return NextResponse.json(
      { error: 'Failed to delete stat', details: error.message },
      { status: 500 }
    );
  }
}