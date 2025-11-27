import { JWTUtils } from './jwt';

export class TokenGenerators {
  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(userId: number, email: string): string {
    return JWTUtils.generateShortLivedToken(
      {
        userId,
        email,
        purpose: 'email_verification',
      },
      '24h', // 24 hours expiry
      process.env.JWT_EMAIL_VERIFICATION_SECRET
    );
  }

  /**
   * Verify email verification token
   */
  static verifyEmailVerificationToken(token: string): { userId: number; email: string } {
    return JWTUtils.verifyShortLivedToken<{ userId: number; email: string; purpose: string }>(
      token,
      process.env.JWT_EMAIL_VERIFICATION_SECRET
    );
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId: number, email: string): string {
    return JWTUtils.generateShortLivedToken(
      {
        userId,
        email,
        purpose: 'password_reset',
      },
      '1h', // 1 hour expiry
      process.env.JWT_PASSWORD_RESET_SECRET
    );
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): { userId: number; email: string } {
    return JWTUtils.verifyShortLivedToken<{ userId: number; email: string; purpose: string }>(
      token,
      process.env.JWT_PASSWORD_RESET_SECRET
    );
  }

  /**
   * Generate API key token (for server-to-server communication)
   */
  static generateApiKeyToken(apiKeyId: string, permissions: string[]): string {
    return JWTUtils.generateShortLivedToken(
      {
        apiKeyId,
        permissions,
        purpose: 'api_key',
      },
      '365d', // 1 year expiry
      process.env.JWT_ACCESS_SECRET
    );
  }

  /**
   * Generate temporary access token (for one-time actions)
   */
  static generateTemporaryAccessToken(
    userId: number,
    email: string,
    role: string,
    expiresIn: string = '5m'
  ): string {
    return JWTUtils.generateShortLivedToken(
      {
        userId,
        email,
        role,
        purpose: 'temporary_access',
      },
      expiresIn
    );
  }
}