import { z } from 'zod';

export const createReviewSchema = z.object({
  serviceId: z.string().uuid('Service ID must be valid UUID').optional(),
  clientName: z.string().min(1, 'Client name is required').max(255),
  clientCompany: z.string().max(255).optional(),
  clientAvatar: z.string().url('Avatar must be a valid URL').optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  reviewText: z.string().min(1, 'Review text is required'),
  projectType: z.string().max(255).optional(),
  completionDate: z.string().datetime().optional(),
  isPublished: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const updateReviewSchema = createReviewSchema.partial();