import type { NextFunction, Request, Response } from "express";

export type LatencySnapshotEntry = {
  key: string;
  count: number;
  sampleSize: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  targetP95Ms?: number;
};

type LatencyBucket = {
  samples: number[];
  count: number;
  maxMs: number;
  lastUpdated: number;
};

const buckets = new Map<string, LatencyBucket>();

const percentile = (samples: number[], percentileValue: number): number => {
  if (samples.length === 0) {
    return 0;
  }

  const sorted = samples.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  const safeIndex = Math.min(Math.max(index, 0), sorted.length - 1);
  return sorted[safeIndex] ?? 0;
};

const recordLatency = (key: string, durationMs: number, sampleSize: number): LatencyBucket => {
  const entry = buckets.get(key) ?? {
    samples: [],
    count: 0,
    maxMs: 0,
    lastUpdated: Date.now(),
  };

  entry.samples.push(durationMs);
  if (entry.samples.length > sampleSize) {
    entry.samples.shift();
  }

  entry.count += 1;
  entry.maxMs = Math.max(entry.maxMs, durationMs);
  entry.lastUpdated = Date.now();
  buckets.set(key, entry);
  return entry;
};

const buildRouteKey = (req: Request): string => {
  const routePath = req.route?.path;
  const base = req.baseUrl ?? "";
  const path = routePath ? `${base}${routePath}` : req.path;
  return `${req.method} ${path}`;
};

type RequestMetricsOptions = {
  sampleSize: number;
  targetP95Ms?: number;
};

export const requestMetrics = (options: RequestMetricsOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      const key = buildRouteKey(req);
      recordLatency(key, durationMs, options.sampleSize);

      if (options.targetP95Ms !== undefined && durationMs > options.targetP95Ms) {
        console.warn(
          `[latency] ${key} ${durationMs.toFixed(1)}ms exceeded target ${options.targetP95Ms}ms`
        );
      }
    });

    next();
  };
};

export const getLatencySnapshot = (targetP95Ms?: number): LatencySnapshotEntry[] => {
  const entries: LatencySnapshotEntry[] = [];

  for (const [key, bucket] of buckets.entries()) {
    const p50Ms = percentile(bucket.samples, 50);
    const p95Ms = percentile(bucket.samples, 95);

    entries.push({
      key,
      count: bucket.count,
      sampleSize: bucket.samples.length,
      p50Ms: Number(p50Ms.toFixed(1)),
      p95Ms: Number(p95Ms.toFixed(1)),
      maxMs: Number(bucket.maxMs.toFixed(1)),
      ...(targetP95Ms !== undefined ? { targetP95Ms } : {}),
    });
  }

  return entries.sort((a, b) => b.p95Ms - a.p95Ms);
};
