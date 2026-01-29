import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/admin/check-blob
 * Debug endpoint to check if Blob storage is configured
 */
export async function GET() {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const blobEnvVars = Object.keys(process.env).filter(k => k.toLowerCase().includes('blob'));

  return NextResponse.json({
    isVercel,
    hasBlobToken,
    blobTokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
    blobEnvVars,
    vercelEnv: process.env.VERCEL_ENV || 'not set',
  });
}
