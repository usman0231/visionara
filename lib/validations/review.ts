import { z } from 'zod';

export const createReviewSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  role: z.string().max(255).optional().nullable(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  text: z.string().min(1, 'Review text is required'),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateReviewSchema = createReviewSchema.partial();
