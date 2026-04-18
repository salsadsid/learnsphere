import type { Response } from "express";
import { config } from "../../../shared/config";

const isProduction = config.nodeEnv === "production";

const COOKIE_OPTIONS_BASE = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

const ACCESS_TOKEN_MAX_AGE_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie("access_token", accessToken, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });

  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/api/v1/auth",
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("access_token", {
    ...COOKIE_OPTIONS_BASE,
  });

  res.clearCookie("refresh_token", {
    ...COOKIE_OPTIONS_BASE,
    path: "/api/v1/auth",
  });
}
