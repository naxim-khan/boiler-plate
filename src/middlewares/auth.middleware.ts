import type { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';
import * as userRepository from '../repositories/user.repository';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required', ERROR_CODES.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const payload = JWTUtils.verifyAccessToken(token);

    // Check if user still exists
    const user = await userRepository.getUserById(payload.userId);

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role || 'USER',
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(401, 'Invalid access token', ERROR_CODES.INVALID_TOKEN));
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JWTUtils.verifyAccessToken(token);
      const user = await userRepository.getUserById(payload.userId);

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role || 'USER',
      };
    }

    next();
  } catch (error) {
    // If auth fails, just continue without user
    next();
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, 'Insufficient permissions', ERROR_CODES.FORBIDDEN);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
    }

    const requestedUserId = Number(req.params.id);

    if (isNaN(requestedUserId)) {
      throw new ApiError(400, 'Invalid user ID', ERROR_CODES.INVALID_INPUT);
    }

    // Admin can do anything
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Moderator permissions
    if (req.user.role === 'MODERATOR') {
      // For GET requests, allow access to any user
      if (req.method === 'GET') {
        return next();
      }
      // For other methods (PUT, DELETE), only allow if modifying themselves
      if (req.user.userId === requestedUserId) {
        return next();
      }
      throw new ApiError(403, 'Moderators can only modify their own account', ERROR_CODES.FORBIDDEN);
    }

    // Regular users can only access their own data for any operation
    if (req.user.userId === requestedUserId) {
      return next();
    }

    throw new ApiError(403, 'You can only access your own data', ERROR_CODES.FORBIDDEN);
  } catch (error) {
    next(error);
  }
};

// Add a new middleware for self-management only (no moderators allowed for user routes)
export const requireOwnerOnly = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
    }

    const requestedUserId = Number(req.params.id);

    // Only allow if user is accessing their own data
    if (req.user.userId === requestedUserId) {
      return next();
    }

    throw new ApiError(403, 'You can only access your own data', ERROR_CODES.FORBIDDEN);
  } catch (error) {
    next(error);
  }
};

// Specific middleware for update operations
export const canUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
    }

    const requestedUserId = Number(req.params.id);
    
    if (isNaN(requestedUserId)) {
      throw new ApiError(400, 'Invalid user ID', ERROR_CODES.INVALID_INPUT);
    }

    // Admin can update any user
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Moderator can only update themselves
    if (req.user.role === 'MODERATOR') {
      if (req.user.userId === requestedUserId) {
        return next();
      }
      throw new ApiError(403, 'Moderators can only update their own account', ERROR_CODES.FORBIDDEN);
    }
    
    // Regular users can only update themselves
    if (req.user.userId === requestedUserId) {
      return next();
    }

    throw new ApiError(403, 'You can only update your own account', ERROR_CODES.FORBIDDEN);
  } catch (error) {
    next(error);
  }
};

export const canDeleteUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
    }

    const requestedUserId = Number(req.params.id);
    
    if (isNaN(requestedUserId)) {
      throw new ApiError(400, 'Invalid user ID', ERROR_CODES.INVALID_INPUT);
    }

    // Admin can delete any user
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Moderator can only delete themselves
    if (req.user.role === 'MODERATOR') {
      if (req.user.userId === requestedUserId) {
        return next();
      }
      throw new ApiError(403, 'Moderators can only delete their own account', ERROR_CODES.FORBIDDEN);
    }
    
    // Regular users can only delete themselves
    if (req.user.userId === requestedUserId) {
      return next();
    }

    throw new ApiError(403, 'You can only delete your own account', ERROR_CODES.FORBIDDEN);
  } catch (error) {
    next(error);
  }
};

// Middleware to prevent users from modifying their own role
export const preventSelfRoleChange = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required', ERROR_CODES.UNAUTHORIZED);
    }

    const requestedUserId = Number(req.params.id);
    
    // If user is trying to modify their own account and includes role in update
    if (req.user.userId === requestedUserId && req.body.role) {
      throw new ApiError(403, 'You cannot change your own role', ERROR_CODES.FORBIDDEN);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const normalizeRole = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body && req.body.role && typeof req.body.role === 'string') {
      req.body.role = req.body.role.toUpperCase().trim();
    }
    next();
  } catch (error) {
    next(error);
  }
};


// Common role checks
export const requireAdmin = requireRole(['ADMIN']);
export const requireModerator = requireRole(['MODERATOR', 'ADMIN']);
export const requireUser = requireRole(['USER', 'MODERATOR', 'ADMIN']);