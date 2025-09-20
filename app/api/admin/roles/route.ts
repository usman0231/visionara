import { NextResponse } from 'next/server';
import { Role } from '@/lib/db/models';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles', details: error.message },
      { status: 500 }
    );
  }
}