import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// Cache tags for different data types
export const CACHE_TAGS = {
  projects: 'projects',
  services: 'services',
  reviews: 'reviews',
  packages: 'packages',
  stats: 'stats',
  all: 'all',
} as const;

/**
 * POST /api/admin/revalidate
 * Clear cache for specific tags or all cache
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { tags, paths } = body as { tags?: string[]; paths?: string[] };

    const revalidated: string[] = [];

    // Revalidate specific tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        if (tag === 'all') {
          // Revalidate all known tags
          Object.values(CACHE_TAGS).forEach(t => {
            if (t !== 'all') {
              revalidateTag(t);
              revalidated.push(`tag:${t}`);
            }
          });
        } else {
          revalidateTag(tag);
          revalidated.push(`tag:${tag}`);
        }
      }
    }

    // Revalidate specific paths
    if (paths && paths.length > 0) {
      for (const path of paths) {
        revalidatePath(path);
        revalidated.push(`path:${path}`);
      }
    }

    // If nothing specified, revalidate common paths
    if ((!tags || tags.length === 0) && (!paths || paths.length === 0)) {
      revalidatePath('/', 'layout');
      revalidated.push('path:/ (full site)');
    }

    return NextResponse.json({
      success: true,
      revalidated,
      message: `Cache cleared for: ${revalidated.join(', ')}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to revalidate cache', details: message },
      { status: 500 }
    );
  }
}
