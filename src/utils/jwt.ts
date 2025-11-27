import jwt from 'jsonwebtoken';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTUtils {
  private static readonly ACCESS_TOKEN_SECRET: string = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET: string = process.env.JWT_REFRESH_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRY: string = process.env.JWT_ACCESS_EXPIRY || '15m';
  private static readonly REFRESH_TOKEN_EXPIRY: string = process.env.JWT_REFRESH_EXPIRY || '7d';

  static {
    if (!this.ACCESS_TOKEN_SECRET || !this.REFRESH_TOKEN_SECRET) {
      throw new Error('JWT secrets must be provided in environment variables');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  static generateTokens(payload: TokenPayload): Tokens {
    try {
      const accessToken = jwt.sign(
        payload, 
        this.ACCESS_TOKEN_SECRET, 
        { expiresIn: this.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        payload, 
        this.REFRESH_TOKEN_SECRET, 
        { expiresIn: this.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
      );

      // Parse expiry to seconds
      const expiresIn = this.parseExpiryToSeconds(this.ACCESS_TOKEN_EXPIRY);

      return {
        accessToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to generate tokens', ERROR_CODES.INTERNAL);
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error: any) {
      this.handleJWTError(error);
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch (error: any) {
      this.handleJWTError(error);
    }
  }

  /**
   * Refresh access token
   */
  static refreshAccessToken(refreshToken: string): { accessToken: string; expiresIn: number } {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      const accessToken = jwt.sign(
        payload, 
        this.ACCESS_TOKEN_SECRET, 
        { expiresIn: this.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
      );

      const expiresIn = this.parseExpiryToSeconds(this.ACCESS_TOKEN_EXPIRY);

      return { accessToken, expiresIn };
    } catch (error: any) {
      this.handleJWTError(error);
    }
  }

  /**
   * Generate a short-lived token for specific purposes
   */
  static generateShortLivedToken(
    payload: Record<string, any>,
    expiresIn: string = '1h',
    secret?: string
  ): string {
    try {
      return jwt.sign(
        payload,
        secret || this.ACCESS_TOKEN_SECRET,
        { expiresIn } as jwt.SignOptions
      );
    } catch (error) {
      throw new ApiError(500, 'Failed to generate token', ERROR_CODES.INTERNAL);
    }
  }

  /**
   * Verify a short-lived token
   */
  static verifyShortLivedToken<T = any>(token: string, secret?: string): T {
    try {
      const verified = jwt.verify(token, secret || this.ACCESS_TOKEN_SECRET);
      return verified as T;
    } catch (error: any) {
      this.handleJWTError(error);
    }
  }

  /**
   * Handle JWT errors
   */
  private static handleJWTError(error: any): never {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired', ERROR_CODES.TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token', ERROR_CODES.INVALID_TOKEN);
    }
    throw new ApiError(500, 'Token verification failed', ERROR_CODES.INTERNAL);
  }

  /**
   * Parse expiry string to seconds
   */
  private static parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60;

    const value = parseInt(match[1]!, 10); // Non-null assertion and radix
    const unit = match[2]!; // Non-null assertion

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 15 * 60;
    }
  }
}