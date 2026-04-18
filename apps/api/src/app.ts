import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import type { Request, Response } from "express";
import { config } from "./shared/config";
import { errorHandler, notFoundHandler } from "./shared/errors";
import { requestLogger } from "./shared/logging";
import { getLatencySnapshot, requestMetrics } from "./shared/performance";
import { isDatabaseConnected } from "./shared/db";
import { createRateLimiter } from "./shared/rate-limit";
import { authRouter } from "./modules/auth/http/routes";
import { coursesRouter } from "./modules/courses/http/routes";
import { videosRouter } from "./modules/videos/http/routes";
import { progressRouter } from "./modules/progress/http/routes";
import { enrollmentRouter } from "./modules/enrollment/http/routes";
import { paymentsRouter } from "./modules/payments/http/routes";
import { adminRouter } from "./modules/admin/http/routes";

export const app = express();
app.disable("x-powered-by");
app.use(requestLogger());
app.use(
  requestMetrics({
    sampleSize: config.metricsSampleSize,
    targetP95Ms: config.p95TargetMs,
  })
);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
}));
app.use(cookieParser());
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: config.requestBodyLimit }));

const standardLimiter = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.rateLimitMax,
  keyPrefix: "api",
});
const authLimiter = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.authRateLimitMax,
  keyPrefix: "auth",
});
const adminLimiter = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.adminRateLimitMax,
  keyPrefix: "admin",
});

const startedAt = Date.now();
const getUptimeSeconds = () => Math.floor((Date.now() - startedAt) / 1000);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
});

app.get("/ready", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    uptimeSeconds: getUptimeSeconds(),
    dbConnected: isDatabaseConnected(),
  });
});

app.get("/metrics/latency", (_req: Request, res: Response) => {
  res.json({
    targetP95Ms: config.p95TargetMs,
    sampleSize: config.metricsSampleSize,
    routes: getLatencySnapshot(config.p95TargetMs),
  });
});

app.options(/\/api\/v1\/.*/, (_req: Request, res: Response) => {
  res.sendStatus(204);
});

app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/courses", standardLimiter, coursesRouter);
app.use("/api/v1/videos", standardLimiter, videosRouter);
app.use("/api/v1/progress", standardLimiter, progressRouter);
app.use("/api/v1/enrollments", standardLimiter, enrollmentRouter);
app.use("/api/v1/payments", standardLimiter, paymentsRouter);
app.use("/api/v1/admin", adminLimiter, adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
