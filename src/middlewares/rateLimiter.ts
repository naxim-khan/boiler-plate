import type { Request, Response, NextFunction } from "express";
import redis from "../config/redis";
import { RedisKeys } from "../utils/redisKeys";
import { ApiError } from "../common/errors/api-error";
import { ERROR_CODES } from "../common/errors/error-codes";

export const rateLimiter =
  (limit: number, windowSeconds: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || "unknown";
      const key = RedisKeys.rateLimit(ip);

      // Increment request count
      const current = await redis.incr(key);

      // Set TTL on first hit
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Reject if exceeded
      if (current > limit) {
        throw new ApiError(
          429,
          "Too many requests. Try again later.",
          ERROR_CODES.RATE_LIMIT_EXCEEDED || "RATE_LIMIT_EXCEEDED"
        );
      }

      next();
    } catch (err) {
      // If Redis fails, still allow request (fail-open)
      if (err instanceof ApiError) {
        return next(err);
      }

      console.error("Rate Limiter Redis Error:", err);
      next(); 
    }
  };