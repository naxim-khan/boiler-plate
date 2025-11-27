import type { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';

/**
 * Middleware to validate request body, query, and params using Zod schema
 * Now supports async validation for email domain checks
 */
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