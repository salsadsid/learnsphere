import express from "express";
import cors from "cors";
import { config } from "./shared/config";
import { errorHandler, notFoundHandler } from "./shared/errors";
import { requestLogger } from "./shared/logging";
import { authRouter } from "./modules/auth/http/routes";
import { coursesRouter } from "./modules/courses/http/routes";

export const app = express();
app.use(requestLogger());
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  })
);
app.use(express.json());

const startedAt = Date.now();
const getUptimeSeconds = () => Math.floor((Date.now() - startedAt) / 1000);

app.get("/health", (_req, res) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
});

app.get("/ready", (_req, res) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
});

app.options(/\/api\/v1\/.*/, (_req, res) => {
  res.sendStatus(204);
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/courses", coursesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
