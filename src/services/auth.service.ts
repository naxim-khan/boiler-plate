import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';
import * as userRepository from '../repositories/user.repository';
import { hashPassword, verifyPassword } from '../utils/password.util';
import { JWTUtils } from '../utils/jwt'; // Remove 'type' import
import type { TokenPayload, Tokens } from '../utils/jwt'; // Keep types as type imports
import type { 
  RegisterInput, 
  LoginInput, 
  RefreshTokenInput, 
  ChangePasswordInput 
} from '../validations/auth.validation';

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: Tokens;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await userRepository.emailExists(data.email);
      if (existingUser) {
        throw new ApiError(
          409,
          'A user with this email already exists',
          ERROR_CODES.DUPLICATE_VALUE,
          { email: data.email }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = await userRepository.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'USER',
      };

      const tokens = JWTUtils.generateTokens(tokenPayload);

      return {
        user,
        tokens,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Registration failed', ERROR_CODES.INTERNAL);
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginInput): Promise<AuthResponse> {
    try {
      // Get user with password (for verification)
      const user = await userRepository.getUserByEmail(data.email);

      // Verify password
      const isPasswordValid = await verifyPassword(data.password, user.password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials', ERROR_CODES.UNAUTHORIZED);
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'USER',
      };

      const tokens = JWTUtils.generateTokens(tokenPayload);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid credentials', ERROR_CODES.UNAUTHORIZED);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<Tokens> {
    try {
      // Verify refresh token
      const payload = JWTUtils.verifyRefreshToken(refreshToken);

      // Check if user still exists
      const user = await userRepository.getUserById(payload.userId);

      // Generate new tokens
      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'USER',
      };

      return JWTUtils.generateTokens(newPayload);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid refresh token', ERROR_CODES.INVALID_TOKEN);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: number, data: ChangePasswordInput): Promise<void> {
    try {
      // Get user with current password
      const user = await userRepository.getUserByEmail((await userRepository.getUserById(userId)).email);

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new ApiError(400, 'Current password is incorrect', ERROR_CODES.INVALID_INPUT);
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(data.newPassword);

      // Update password
      await userRepository.updateUser(userId, {
        password: hashedNewPassword,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Password change failed', ERROR_CODES.INTERNAL);
    }
  }

  /**
   * Verify user credentials (for middleware)
   */
  static async verifyUserCredentials(email: string, password: string): Promise<boolean> {
    try {
      const user = await userRepository.getUserByEmail(email);
      return await verifyPassword(password, user.password);
    } catch {
      return false;
    }
  }
}