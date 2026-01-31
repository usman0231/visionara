import { z } from 'zod';

// Helper for optional URL that can be empty, null, or undefined
const optionalUrl = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().url('Icon URL must be a valid URL').optional()
);

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  text: z.string().min(1, 'Text is required'),
  iconUrl: optionalUrl,
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  text: z.string().min(1, 'Text is required').optional(),
  iconUrl: optionalUrl,
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});