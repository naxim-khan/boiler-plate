import { z } from 'zod';
import { passwordSchema } from './user.validation';
import { validateEmailDomain } from './emailValidator';

// User roles enum
export const UserRole = z.enum(['USER', 'ADMIN', 'MODERATOR']);
export type UserRole = z.infer<typeof UserRole>;

// Custom email validation with domain check
const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .trim()
  .toLowerCase()
  .refine(async (email) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Domain validation (only in production or if enabled)
    if (process.env.VALIDATE_EMAIL_DOMAIN === 'true' || process.env.NODE_ENV === 'production') {
      return await validateEmailDomain(email);
    }

    // Skip domain validation in development by default
    return true;
  }, {
    message: 'Email domain is invalid or does not exist',
  });

// Register validation schema - PUBLIC registration (no role selection)
export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .trim()
      .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    // Remove role selection from public registration - always default to USER
    role: z.literal('USER').optional().default('USER'), // Only allow USER role for public registration
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .strict(),
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email must be less than 255 characters')
      .trim()
      .toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }).strict(),
});

// Refresh token validation schema - make refreshToken optional (can come from cookies)
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(), // Optional because it can come from cookies
  }).strict(),
  
});

// Change password validation schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Confirm new password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }).strict(),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }).strict(),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Confirm new password is required'),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  }).strict(),
});

// Email verification validation schema
export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

// Resend email verification validation schema
export const resendEmailVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }).strict(),
});

// Update profile validation schema (for users updating their own profile)
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Name must be at least 1 character')
      .max(100, 'Name must be less than 100 characters')
      .trim()
      .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
      .optional(),
    email: emailSchema.optional(),
    // Note: password changes should use changePassword endpoint
  }).strict()
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one field (name or email) must be provided for update",
  }),
});

// Update role validation schema (admin only) - MOVE TO USER VALIDATION
// This belongs in user validation since it's user management, not auth
export const updateRoleSchema = z.object({
  body: z.object({
    role: UserRole,
  }).strict(),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a numeric value'), // Changed from userId to id for consistency
  }),
});

// Delete user validation schema - MOVE TO USER VALIDATION
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a numeric value'), // Changed from userId to id
  }),
});

// Get user by ID validation schema - MOVE TO USER VALIDATION
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a numeric value'), // Changed from userId to id
  }),
});

// Pagination and filtering for users list (admin only) - MOVE TO USER VALIDATION
export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a numeric value').optional().default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a numeric value').optional().default('10'),
    search: z.string().max(100, 'Search term too long').optional(),
    role: UserRole.optional(),
    sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Export types for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['params'];
export type ResendEmailVerificationInput = z.infer<typeof resendEmailVerificationSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];

// Note: The following types should be moved to user validation
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>['body'] & { userId: number };
export type GetUsersInput = z.infer<typeof getUsersSchema>['query'];

// Validation middleware helper - Updated to only include auth-related schemas
export const validateAuthData = {
  register: registerSchema,
  login: loginSchema,
  refreshToken: refreshTokenSchema,
  changePassword: changePasswordSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  verifyEmail: verifyEmailSchema,
  resendEmailVerification: resendEmailVerificationSchema,
  updateProfile: updateProfileSchema,
  // Removed user management schemas - they belong in user validation
};