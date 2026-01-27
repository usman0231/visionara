import { z } from 'zod';

export const createGalleryItemSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL is required'),
  alt: z.string().min(1, 'Alt text is required').max(255),
  serviceId: z.string().uuid('Service ID must be valid UUID').nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateGalleryItemSchema = createGalleryItemSchema.partial();