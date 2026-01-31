import { z } from 'zod';

export const createPackageSchema = z.object({
  category: z.enum(['Web', 'Mobile', 'Graphic', 'Marketing']),
  tier: z.enum(['Basic', 'Standard', 'Enterprise']),
  priceOnetime: z.string().min(1, 'One-time price is required'),
  priceMonthly: z.string().min(1, 'Monthly price is required'),
  priceYearly: z.string().min(1, 'Yearly price is required'),
  features: z.array(z.string()).default([]),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updatePackageSchema = createPackageSchema.partial();
