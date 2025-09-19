import { z } from "zod";

export const createFAQSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be less than 1000 characters"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(5000, "Answer must be less than 5000 characters"),
  category: z
    .string()
    .max(255, "Category must be less than 255 characters")
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .optional(),
  active: z.boolean().default(true),
});

export const updateFAQSchema = createFAQSchema.partial();

export const faqQuerySchema = z.object({
  category: z.string().optional(),
  active: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

export type CreateFAQRequest = z.infer<typeof createFAQSchema>;
export type UpdateFAQRequest = z.infer<typeof updateFAQSchema>;
export type FAQQueryParams = z.infer<typeof faqQuerySchema>;
