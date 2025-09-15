import { z } from 'zod';

export const createPackageSchema = z.object({
  serviceId: z.string().uuid('Service ID must be valid UUID'),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  duration: z.string().max(100).optional(),
  features: z.array(z.string()).default([]),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export const updatePackageSchema = createPackageSchema.partial();