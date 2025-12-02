import redis from "../config/redis";
import type { Request, Response, NextFunction } from "express";

export const loginAttemptLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email; // Or req.ip
  const key = `login:attempts:${email}`;

  const attempts = await redis.incr(key);

  if (attempts === 1) await redis.expire(key, 60 * 5); // 5 minutes

  if (attempts > 5) {
    return res.status(429).json({
      message: "Too many login attempts. Try again later.",
    });
  }

  next();
};
