import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

type RequestWithId = Request & { requestId?: string };

type LoggerOptions = {
  headerName?: string;
};

const DEFAULT_HEADER_NAME = "x-request-id";

export const requestLogger = (options: LoggerOptions = {}) => {
  const headerName = options.headerName ?? DEFAULT_HEADER_NAME;

  return (req: RequestWithId, res: Response, next: NextFunction): void => {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader(headerName, requestId);

    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      console.log(
        `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
      );
    });

    next();
  };
};
