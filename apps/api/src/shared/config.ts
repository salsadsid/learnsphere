import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(1),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  REQUEST_BODY_LIMIT: z.string().default("1mb"),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().optional(),
  P95_TARGET_MS: z.coerce.number().default(400),
  METRICS_SAMPLE_SIZE: z.coerce.number().default(200),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(240),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(60),
  ADMIN_RATE_LIMIT_MAX: z.coerce.number().default(180),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  REDIS_URL: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  DEMO_SEED: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  DEMO_INSTRUCTOR_EMAIL: z.string().email().optional(),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export type AppConfig = {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  webOrigin: string;
  requestBodyLimit: string;
  mongoUri?: string;
  mongoDbName?: string;
  paymentWebhookSecret?: string;
  redisUrl?: string;
  adminEmail?: string;
  adminPassword?: string;
  p95TargetMs: number;
  metricsSampleSize: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  authRateLimitMax: number;
  adminRateLimitMax: number;
  demoSeedEnabled: boolean;
  demoInstructorEmail?: string;
};

export const config: AppConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  jwtSecret: env.JWT_SECRET,
  webOrigin: env.WEB_ORIGIN,
  requestBodyLimit: env.REQUEST_BODY_LIMIT,
  p95TargetMs: env.P95_TARGET_MS,
  metricsSampleSize: env.METRICS_SAMPLE_SIZE,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,
  authRateLimitMax: env.AUTH_RATE_LIMIT_MAX,
  adminRateLimitMax: env.ADMIN_RATE_LIMIT_MAX,
  demoSeedEnabled: env.DEMO_SEED,
  ...(env.MONGODB_URI !== undefined ? { mongoUri: env.MONGODB_URI } : {}),
  ...(env.MONGODB_DB !== undefined ? { mongoDbName: env.MONGODB_DB } : {}),
  ...(env.PAYMENT_WEBHOOK_SECRET !== undefined
    ? { paymentWebhookSecret: env.PAYMENT_WEBHOOK_SECRET }
    : {}),
  ...(env.REDIS_URL !== undefined ? { redisUrl: env.REDIS_URL } : {}),
  ...(env.ADMIN_EMAIL !== undefined ? { adminEmail: env.ADMIN_EMAIL } : {}),
  ...(env.ADMIN_PASSWORD !== undefined ? { adminPassword: env.ADMIN_PASSWORD } : {}),
  ...(env.DEMO_INSTRUCTOR_EMAIL !== undefined
    ? { demoInstructorEmail: env.DEMO_INSTRUCTOR_EMAIL }
    : {}),
};
