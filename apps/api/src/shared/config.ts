import dotenv from "dotenv";

dotenv.config();

type AppConfig = {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  webOrigin: string;
  paymentWebhookSecret?: string;
  redisUrl?: string;
  adminEmail?: string;
  adminPassword?: string;
  p95TargetMs: number;
  metricsSampleSize: number;
  demoSeedEnabled: boolean;
  demoInstructorEmail?: string;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config: AppConfig = {
  port: parseNumber(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  p95TargetMs: parseNumber(process.env.P95_TARGET_MS, 400),
  metricsSampleSize: parseNumber(process.env.METRICS_SAMPLE_SIZE, 200),
  ...(process.env.PAYMENT_WEBHOOK_SECRET !== undefined
    ? { paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET }
    : {}),
  ...(process.env.REDIS_URL !== undefined ? { redisUrl: process.env.REDIS_URL } : {}),
  ...(process.env.ADMIN_EMAIL !== undefined ? { adminEmail: process.env.ADMIN_EMAIL } : {}),
  ...(process.env.ADMIN_PASSWORD !== undefined
    ? { adminPassword: process.env.ADMIN_PASSWORD }
    : {}),
  demoSeedEnabled: process.env.DEMO_SEED === "true",
  ...(process.env.DEMO_INSTRUCTOR_EMAIL !== undefined
    ? { demoInstructorEmail: process.env.DEMO_INSTRUCTOR_EMAIL }
    : {}),
};
