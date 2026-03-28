import express from "express";
import { config } from "./shared/config";
import { errorHandler, notFoundHandler } from "./shared/errors";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(notFoundHandler);
app.use(errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`API running on ${port}`);
});
