import express from "express";
import { config } from "./shared/config";
import { errorHandler, notFoundHandler } from "./shared/errors";
import { requestLogger } from "./shared/logging";
import { authRouter } from "./modules/auth/http/routes";

const app = express();
app.use(requestLogger());
app.use(express.json());

const startedAt = Date.now();
const getUptimeSeconds = () => Math.floor((Date.now() - startedAt) / 1000);

app.get("/health", (_req, res) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
});

app.get("/ready", (_req, res) => {
  res.json({ ok: true, uptimeSeconds: getUptimeSeconds() });
});

app.use("/api/v1/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`API running on ${port}`);
});
