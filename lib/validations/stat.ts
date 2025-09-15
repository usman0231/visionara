import { z } from 'zod';

export const createStatSchema = z.object({
  label: z.string().min(1, 'Label is required').max(255),
  value: z.string().min(1, 'Value is required').max(100),
  description: z.string().optional(),
  icon: z.string().max(100).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateStatSchema = createStatSchema.partial();