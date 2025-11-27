import { z } from 'zod';
import { validateEmailDomain } from './emailValidator';

// Password schema for user validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

// Base user schema
export const userBaseSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" })
    .trim(),
  email: z.string()
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email is required" })
    .max(255, { message: "Email must be less than 255 characters" })
    .trim()
    .toLowerCase()
    .refine(async (val) => await validateEmailDomain(val), {
      message: "Email domain does not exist or cannot receive emails",
    }),
});

// Admin create user schema (for user routes - admin only)
export const createUserSchema = z.object({
  body: userBaseSchema.extend({
    password: passwordSchema,
    role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional().default('USER'),
  }).strict(),
});

// Update user validation (for admin updating any user)
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, { message: "Name must be at least 1 character" })
      .max(100, { message: "Name must be less than 100 characters" })
      .trim()
      .optional(),
    email: z.string()
      .email({ message: "Invalid email format" })
      .min(5, { message: "Email must be at least 5 characters" })
      .max(255, { message: "Email must be less than 255 characters" })
      .trim()
      .toLowerCase()
      .optional()
      .refine(async (val) => {
        if (!val) return true; // skip if not provided
        return await validateEmailDomain(val);
      }, {
        message: "Email domain does not exist or cannot receive emails",
      }),
    password: passwordSchema.optional(),
    role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
  }).strict(),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a numeric value'),
  }),
});

// Self update schema (users updating their own profile - no role/password change)
export const updateSelfSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, { message: "Name must be at least 1 character" })
      .max(100, { message: "Name must be less than 100 characters" })
      .trim()
      .optional(),
    email: z.string()
      .email({ message: "Invalid email format" })
      .min(5, { message: "Email must be at least 5 characters" })
      .max(255, { message: "Email must be less than 255 characters" })
      .trim()
      .toLowerCase()
      .optional()
      .refine(async (val) => {
        if (!val) return true;
        return await validateEmailDomain(val);
      }, {
        message: "Email domain does not exist or cannot receive emails",
      }),
    // Note: Password changes should use the change password endpoint
  }).strict(),
});

// Get/Delete user by ID validation
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a numeric value'),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a numeric value'),
  }),
});

// Export types for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateSelfInput = z.infer<typeof updateSelfSchema>['body'];