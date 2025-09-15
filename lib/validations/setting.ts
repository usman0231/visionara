import { z } from 'zod';

export const createSettingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(255),
  value: z.any(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  isPublic: z.boolean().default(false),
});

export const updateSettingSchema = createSettingSchema.partial().omit({ key: true });