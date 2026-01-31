declare module '@vercel/blob' {
  export interface PutBlobResult {
    url: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;
  }

  export interface PutOptions {
    access: 'public' | 'private';
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
    contentType?: string;
  }

  export function put(
    pathname: string,
    body: File | Blob | ArrayBuffer | Buffer | string | ReadableStream,
    options: PutOptions
  ): Promise<PutBlobResult>;

  export function del(url: string | string[]): Promise<void>;

  export function head(url: string): Promise<PutBlobResult | null>;

  export function list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    blobs: PutBlobResult[];
    cursor?: string;
    hasMore: boolean;
  }>;
}
