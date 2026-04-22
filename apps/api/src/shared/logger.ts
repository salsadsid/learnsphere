import pino from "pino";
import { config } from "./config";

const options: pino.LoggerOptions = {
  level: config.nodeEnv === "test" ? "silent" : "info",
  base: { service: "learnsphere-api", env: config.nodeEnv },
};

if (config.nodeEnv === "development") {
  options.transport = { target: "pino-pretty", options: { colorize: true } };
}

export const logger = pino(options);

export const createChildLogger = (context: Record<string, unknown>) =>
  logger.child(context);
