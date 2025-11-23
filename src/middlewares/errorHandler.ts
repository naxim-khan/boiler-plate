// src/middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/errors/api-error';
import logger from '../config/logger';
import { errorResponse } from '../utils/response';

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error({
    method: req.method,
    path: req.path,
    message: err.message,
    stack: err.stack,
    ...(err.details ? { details: err.details } : {}),
  });

  // Handle known ApiError
  if (err instanceof ApiError) {
    return errorResponse(
      res,
      err.statusCode,
      err.message,
      err.code,
      err.details
    );
  }

  // Fallback for unknown errors
  return errorResponse(
    res,
    500,
    'Internal Server Error',
    'INTERNAL_SERVER_ERROR',
    err
  );
}
