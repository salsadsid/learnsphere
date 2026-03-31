import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { config } from "./shared/config";
import { errorHandler, notFoundHandler } from "./shared/errors";
import { requestLogger } from "./shared/logging";
import { getLatencySnapshot, requestMetrics } from "./shared/performance";
import { authRouter } from "./modules/auth/http/routes";
import { coursesRouter } from "./modules/courses/http/routes";
import { videosRouter } from "./modules/videos/http/routes";
import { progressRouter } from "./modules/progress/http/routes";
import { enrollmentRouter } from "./modules/enrollment/http/routes";
import { paymentsRouter } from "./modules/payments/http/routes";

export const app = express();
app.use(requestLogger());
app.use(
  requestMetrics({
    sampleSize: config.metricsSampleSize,
    targetP95Ms: config.p95TargetMs,
  })
);
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());

const startedAt = Date.now();
const getUptimeSeconds = () => Math.floor((Date.now() - startedAt) / 1000);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
});

app.get("/ready", (_req: Request, res: Response) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/videos", videosRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/enrollments", enrollmentRouter);
app.use("/api/v1/payments", paymentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
