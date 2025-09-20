import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name is too long'),
  roleId: z.string().uuid('Please select a valid role'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name is too long').optional(),
  roleId: z.string().uuid('Please select a valid role').optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;