import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/lib/db/models';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/packages
 * Fetch all packages
 */
export async function GET(request: NextRequest) {
  try {
    const packages = await Package.findAll({
      where: {
        deletedAt: null
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json(packages);
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/packages
 * Create a new package
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate tier value
    const validTiers = ['Basic', 'Standard', 'Enterprise'];
    if (!validTiers.includes(body.tier)) {
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
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          error: 'Invalid category value',
          details: `Category must be one of: ${validCategories.join(', ')}. Received: '${body.category}'`
        },
        { status: 400 }
      );
    }

    const newPackage = await Package.create({
      category: body.category,
      tier: body.tier,
      priceOnetime: body.priceOnetime,
      priceMonthly: body.priceMonthly,
      priceYearly: body.priceYearly,
      features: body.features || [],
      active: body.active !== undefined ? body.active : true,
      sortOrder: body.sortOrder || 0
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error: any) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package', details: error.message },
      { status: 500 }
    );
  }
}