import { NextRequest, NextResponse } from 'next/server';
import { AboutContent, AboutSection } from '@/lib/db/models';
import { createAboutContentSchema, validateContentBySection } from '@/lib/validations/aboutContent';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * GET /api/admin/about-content
 * Fetch all about content blocks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const whereClause: any = {
      deletedAt: null
    };

    if (section && Object.values(AboutSection).includes(section as AboutSection)) {
      whereClause.section = section;
    }

    const content = await AboutContent.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about content', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/about-content
 * Create a new about content block
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate basic schema
    const validatedData = createAboutContentSchema.parse(body);

    // Validate content based on section type
    try {
      validateContentBySection(validatedData.section, validatedData.content);
    } catch (contentError: any) {
      return NextResponse.json(
        { error: 'Invalid content for section', details: contentError.message },
        { status: 400 }
      );
    }

    // Check if content for this section already exists (some sections should be unique)
    const existingContent = await AboutContent.findOne({
      where: {
        section: validatedData.section,
        deletedAt: null
      }
    });

    // For sections that should be unique, prevent duplicates
    const uniqueSections = ['hero', 'story', 'cta'];
    if (uniqueSections.includes(validatedData.section) && existingContent) {
      return NextResponse.json(
        { error: `Content for ${validatedData.section} section already exists. Update the existing one instead.` },
        { status: 400 }
      );
    }

    const newContent = await AboutContent.create({
      ...validatedData,
      section: validatedData.section as AboutSection,
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error: any) {
    console.error('Error creating about content:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create about content', details: error.message },
      { status: 500 }
    );
  }
}