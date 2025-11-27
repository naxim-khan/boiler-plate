import dns from "dns/promises";
import { z } from 'zod';

// Common disposable email domains (you can expand this list)
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
  'throwawaymail.com', 'fakeinbox.com', 'yopmail.com', 'getairmail.com',
  'tmpmail.org', 'trashmail.com', 'disposablemail.com'
]);

// Common free email providers (for optional filtering)
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com'
]);

export interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  domain?: string;
  isDisposable: boolean;
  isFree: boolean;
  hasMXRecords: boolean;
}

/**
 * Validate email domain by checking MX records
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  if (!email) return false;

  const parts = email.split("@");
  if (parts.length !== 2 || !parts[1]) return false;

  const domain: string = parts[1]!; // Non-null assertion since we checked

  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
}

/**
 * Comprehensive email validation with multiple checks
 */
export async function validateEmailComprehensive(email: string): Promise<EmailValidationResult> {
  if (!email) {
    return {
      isValid: false,
      reason: 'Email is required',
      isDisposable: false,
      isFree: false,
      hasMXRecords: false,
    };
  }

  const parts = email.split("@");
  if (parts.length !== 2 || !parts[1]) {
    return {
      isValid: false,
      reason: 'Invalid email format',
      isDisposable: false,
      isFree: false,
      hasMXRecords: false,
    };
  }

  const domain = parts[1]!.toLowerCase(); // Non-null assertion since we checked
  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);
  const isFree = FREE_EMAIL_DOMAINS.has(domain);

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      reason: 'Invalid email format',
      domain,
      isDisposable,
      isFree,
      hasMXRecords: false,
    };
  }

  // Check for disposable emails
  if (isDisposable) {
    return {
      isValid: false,
      reason: 'Disposable email addresses are not allowed',
      domain,
      isDisposable,
      isFree,
      hasMXRecords: false,
    };
  }

  // Check MX records
  let hasMXRecords = false;
  try {
    const mx = await dns.resolveMx(domain);
    hasMXRecords = Array.isArray(mx) && mx.length > 0;
  } catch {
    hasMXRecords = false;
  }

  if (!hasMXRecords) {
    return {
      isValid: false,
      reason: 'Email domain does not exist or cannot receive emails',
      domain,
      isDisposable,
      isFree,
      hasMXRecords,
    };
  }

  return {
    isValid: true,
    domain,
    isDisposable,
    isFree,
    hasMXRecords,
  };
}

/**
 * Check if email is from a disposable provider
 */
export function isDisposableEmail(email: string): boolean {
  if (!email) return false;
  
  const parts = email.split("@");
  if (parts.length !== 2 || !parts[1]) return false;
  
  const domain = parts[1]!.toLowerCase(); // Non-null assertion since we checked
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Check if email is from a free provider
 */
export function isFreeEmail(email: string): boolean {
  if (!email) return false;
  
  const parts = email.split("@");
  if (parts.length !== 2 || !parts[1]) return false;
  
  const domain = parts[1]!.toLowerCase(); // Non-null assertion since we checked
  return FREE_EMAIL_DOMAINS.has(domain);
}

/**
 * Zod schema for comprehensive email validation
 */
export const comprehensiveEmailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .trim()
  .toLowerCase()
  .refine((email) => !isDisposableEmail(email), {
    message: 'Disposable email addresses are not allowed',
  })
  .refine(async (email) => {
    if (process.env.VALIDATE_EMAIL_DOMAIN === 'true' || process.env.NODE_ENV === 'production') {
      return await validateEmailDomain(email);
    }
    return true;
  }, {
    message: 'Email domain is invalid or does not exist',
  });

/**
 * Schema for business emails only (no free providers)
 */
export const businessEmailSchema = comprehensiveEmailSchema
  .refine((email) => !isFreeEmail(email), {
    message: 'Business email addresses are required (no free providers)',
  });