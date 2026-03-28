import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
};

type Bucket = {
  resetAt: number;
  count: number;
};

const buckets = new Map<string, Bucket>();

export const createRateLimiter = (config: RateLimitConfig) => {
  const keyPrefix = config.keyPrefix ?? "rate";

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { resetAt: now + config.windowMs, count: 1 });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > config.maxRequests) {
      next(
        new AppError({
          status: 429,
          title: "Too Many Requests",
          detail: "Too many attempts. Please try again later.",
          type: "https://httpstatuses.com/429",
        })
      );
      return;
    }

    next();
  };
};
