import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle routes that do not exist.
 * Should be placed after all route definitions.
 */
const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`,
  });
};

export default notFound;
