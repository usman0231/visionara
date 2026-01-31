import { z } from 'zod';

export const createStatSchema = z.object({
  label: z.string().min(1, 'Label is required').max(255),
  value: z.number().int().min(0, 'Value must be a positive number'),
  prefix: z.string().max(50).optional().nullable(),
  suffix: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateStatSchema = createStatSchema.partial();
