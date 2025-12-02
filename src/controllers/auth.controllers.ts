import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';
import { clearUserListCache } from '../utils/clearUserCache';

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    const authResponse = await AuthService.register({
      name,
      email,
      password,
      confirmPassword,
      role,
    });

    // Invalidate user list cache of redis
    await clearUserListCache();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', authResponse.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(
      res,
      'User registered successfully',
      {
        user: authResponse.user,
        tokens: {
          accessToken: authResponse.tokens.accessToken,
          expiresIn: authResponse.tokens.expiresIn,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const authResponse = await AuthService.login({
      email,
      password,
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', authResponse.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(
      res,
      'Login successful',
      {
        user: authResponse.user,
        tokens: {
          accessToken: authResponse.tokens.accessToken,
          expiresIn: authResponse.tokens.expiresIn,
        },
      }
    );
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return successResponse(res, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get refresh token from cookies or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(
        401,
        'Refresh token is required in cookies or request body',
        ERROR_CODES.INVALID_TOKEN
      );
    }

    // Verify and generate new tokens
    const tokens = await AuthService.refreshToken(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token
    return successResponse(
      res,
      'Token refreshed successfully',
      {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // req.user is set by the auth middleware
    const user = (req as any).user;

    if (!user) {
      throw new ApiError(401, 'Not authenticated', ERROR_CODES.UNAUTHORIZED);
    }

    return successResponse(res, 'User profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    await AuthService.changePassword(userId, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};