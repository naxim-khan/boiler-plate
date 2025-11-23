import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { ERROR_CODES } from '../common/errors/error-codes';

/**
 * Middleware to handle routes that do not exist.
 * Should be placed after all route definitions.
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
  return errorResponse(
    res,
    404,
    `Route ${req.originalUrl} not found`,
    ERROR_CODES.NOT_FOUND
  );
};

export default notFound;
