import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  text: z.string().min(1, 'Text is required'),
  iconUrl: z.string().url('Icon URL must be a valid URL').optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateServiceSchema = createServiceSchema.partial();