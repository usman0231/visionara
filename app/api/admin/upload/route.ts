import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Force Node.js runtime for file operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Check if running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

/**
 * OPTIONS /api/admin/upload
 * Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * POST /api/admin/upload
 * Upload an image file and return the URL
 * Uses Vercel Blob in production, local filesystem in development
 */
export async function POST(request: NextRequest) {
  try {
    // Check content length before processing to avoid payload errors
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4MB.' },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 4MB to stay under Vercel's 4.5MB serverless limit)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 4MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${randomUUID()}.${fileExtension}`;

    let url: string;

    // Check if we're on Vercel (production)
    if (isVercel) {
      // Require BLOB_READ_WRITE_TOKEN on Vercel
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (!blobToken) {
        console.error('BLOB_READ_WRITE_TOKEN not configured. Available env vars starting with BLOB:',
          Object.keys(process.env).filter(k => k.includes('BLOB')));
        return NextResponse.json(
          { error: 'Cloud storage not configured. Please add BLOB_READ_WRITE_TOKEN environment variable in Vercel.' },
          { status: 500 }
        );
      }

      try {
        // Dynamic import to avoid build errors when package is not installed
        const { put } = await import('@vercel/blob');
        const blob = await put(`uploads/${fileName}`, file, {
          access: 'public',
          addRandomSuffix: false,
        });
        url = blob.url;
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', blobError);
        return NextResponse.json(
          { error: 'Failed to upload image. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // Local development - use filesystem
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory already exists, continue
      }

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      url = `/uploads/${fileName}`;
    }

    return NextResponse.json({ url }, {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);

    // Handle specific errors with user-friendly messages
    if (error.message?.includes('EROFS') || error.message?.includes('read-only')) {
      return NextResponse.json(
        { error: 'Cloud storage not configured. Please contact administrator.' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}