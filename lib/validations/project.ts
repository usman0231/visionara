import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable().optional(),
  serviceId: z.string().uuid('Service ID must be valid UUID').nullable().optional(),
  coverImage: z.string().min(1, 'Cover image is required'),
  priority: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createProjectImageSchema = z.object({
  projectId: z.string().uuid('Project ID must be valid UUID'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  alt: z.string().min(1, 'Alt text is required').max(255),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProjectImageSchema = createProjectImageSchema.partial().omit({ projectId: true });
