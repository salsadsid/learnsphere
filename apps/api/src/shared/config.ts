import dotenv from "dotenv";

dotenv.config();

type AppConfig = {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  webOrigin: string;
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
};
