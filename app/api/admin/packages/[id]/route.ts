import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/packages/[id]
 * Fetch a single package
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const packageItem = await Package.findByPk(id);

    if (!packageItem) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(packageItem);
  } catch (error: any) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/packages/[id]
 * Update a package
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate tier value
    const validTiers = ['Basic', 'Standard', 'Enterprise'];
    if (body.tier && !validTiers.includes(body.tier)) {
      return NextResponse.json(
        {
          error: 'Invalid tier value',
          details: `Tier must be one of: ${validTiers.join(', ')}. Received: '${body.tier}'`
        },
        { status: 400 }
      );
    }

    // Validate category value
    const validCategories = ['Web', 'Mobile', 'Graphic', 'Marketing'];
    if (body.category && !validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          error: 'Invalid category value',
          details: `Category must be one of: ${validCategories.join(', ')}. Received: '${body.category}'`
        },
        { status: 400 }
      );
    }

    const [updatedRowsCount] = await Package.update(
      {
        category: body.category,
        tier: body.tier,
        priceOnetime: body.priceOnetime,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceYearly,
        features: body.features || [],
        active: body.active !== undefined ? body.active : true,
        sortOrder: body.sortOrder || 0
      },
      {
        where: { id }
      }
    );

    if (updatedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const updatedPackage = await Package.findByPk(id);
    return NextResponse.json(updatedPackage);
  } catch (error: any) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update package', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/packages/[id]
 * Delete a package (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedRowsCount = await Package.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package', details: error.message },
      { status: 500 }
    );
  }
}