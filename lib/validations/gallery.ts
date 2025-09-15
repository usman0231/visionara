import { z } from 'zod';

export const createGalleryItemSchema = z.object({
  serviceId: z.string().uuid('Service ID must be valid UUID').optional(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  imageUrl: z.string().url('Image URL must be valid'),
  alt: z.string().min(1, 'Alt text is required').max(255),
  thumbnailUrl: z.string().url('Thumbnail URL must be valid').optional(),
  projectUrl: z.string().url('Project URL must be valid').optional(),
  technologies: z.array(z.string()).default([]),
  category: z.string().max(100).optional(),
  isPublished: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateGalleryItemSchema = createGalleryItemSchema.partial();