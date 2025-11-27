import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/errors/api-error';
import { ERROR_CODES } from '../common/errors/error-codes';

/**
 * Middleware to handle JSON parsing errors
 */
export const jsonErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return next(
      new ApiError(
        400,
        'Invalid JSON payload',
        ERROR_CODES.INVALID_INPUT,
        {
          type: 'JSON_SYNTAX_ERROR',
          message: 'The request contains invalid JSON format'
        }
      )
    );
  }
  next(err);
};

export default jsonErrorHandler;