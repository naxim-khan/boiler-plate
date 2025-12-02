import type { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';

/**
 * Middleware to validate request body, query, and params using Zod schema
 * Now supports async validation for email domain checks
 */
/**
 * Custom middleware to validate refresh token from cookies or body
 */
export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log('=== REFRESH TOKEN VALIDATION DEBUG ===');
    // console.log('Request headers:', req.headers);
    // console.log('Request cookies:', req.cookies);
    // console.log('Request body:', req.body);
    
    let refreshToken: string | undefined;

    // Try multiple sources for the refresh token
    if (req.cookies?.refreshToken) {
      refreshToken = req.cookies.refreshToken;
      console.log('Found token in parsed cookies');
    } else if (req.headers.cookie) {
      // Manual cookie parsing as fallback
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'refreshToken' && value) {
          refreshToken = value;
          console.log('Found token in manually parsed cookie header');
          break;
        }
      }
    } else if (req.body?.refreshToken) {
      refreshToken = req.body.refreshToken;
      console.log('Found token in request body');
    }

    console.log('Extracted refresh token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'undefined');

    // Validation checks
    if (!refreshToken) {
      throw new ApiError(
        401,
        'Refresh token is required in cookies or request body',
        ERROR_CODES.INVALID_TOKEN
      );
    }

    if (typeof refreshToken !== 'string') {
      throw new ApiError(
        401,
        'Refresh token must be a string',
        ERROR_CODES.INVALID_TOKEN
      );
    }

    const cleanToken = refreshToken.trim();
    if (cleanToken.length < 10) {
      throw new ApiError(
        401,
        'Invalid refresh token format',
        ERROR_CODES.INVALID_TOKEN
      );
    }

    // Ensure req.body exists and attach the token
    req.body = req.body || {};
    req.body.refreshToken = cleanToken;

    console.log('Refresh token validation - Success');
    console.log('Updated req.body:', { refreshToken: `${cleanToken.substring(0, 20)}...` });
    next();
  } catch (error) {
    next(error);
  }
};

export const validateRequest = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.params) req.params = validatedData.params;
      if (validatedData.query) req.query = validatedData.query;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Format validation errors for client
        const formattedErrors = err.issues.map(error => ({
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        }));

        return next(
          new ApiError(
            400,
            'Request validation failed',
            ERROR_CODES.VALIDATION_ERROR,
            {
              validationErrors: formattedErrors,
              totalErrors: formattedErrors.length,
            }
          )
        );
      }
      
      // Pass other errors to global error handler
      next(err);
    }
  };
};