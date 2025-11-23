import type { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError, z } from 'zod';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';

/**
 * Middleware to validate request body, query, and params using Zod schema.
 * Throws ApiError on validation failure, handled by global error middleware.
 */
export const validateRequest = (schema: ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Get structured error tree
        const tree = z.treeifyError(err);
        return next(
          new ApiError(
            400,
            'Validation failed',
            ERROR_CODES.VALIDATION_ERROR,
            tree
          )
        );
      }
      next(err); // pass unknown errors to global error handler
    }
  };
};
