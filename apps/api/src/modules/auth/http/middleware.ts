import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../../shared/config";
import { AppError } from "../../../shared/errors";
import { findUserById } from "../infra/user-store";
import type { AuthUser } from "../domain/types";

type AuthenticatedRequest = Request & { user?: AuthUser };

type JwtPayload = {
  sub?: string;
};

const unauthorizedError = () =>
  new AppError({
    status: 401,
    title: "Unauthorized",
    detail: "Missing or invalid access token.",
    type: "https://httpstatuses.com/401",
  });

const inactiveAccountError = () =>
  new AppError({
    status: 403,
    title: "Forbidden",
    detail: "Account is deactivated.",
    type: "https://httpstatuses.com/403",
  });

function extractToken(req: Request): string | null {
  const cookie = req.cookies?.access_token;
  if (typeof cookie === "string" && cookie.length > 0) {
    return cookie;
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  return null;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    next(unauthorizedError());
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    if (!decoded.sub) {
      next(unauthorizedError());
      return;
    }

    const user = await findUserById(decoded.sub);
    if (!user) {
      next(unauthorizedError());
      return;
    }

    if (!user.isActive) {
      next(inactiveAccountError());
      return;
    }

    req.user = user;
    next();
  } catch (_error) {
    next(unauthorizedError());
  }
};
