import type { Request } from "express";
import { Router } from "express";
import * as bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors";
import { validateLoginInput, validateRefreshInput, validateRegisterInput } from "./validation";
import { issueAccessToken } from "../infra/token";
import {
  createRefreshToken,
  findRefreshToken,
  isRefreshTokenActive,
  revokeRefreshToken,
} from "../infra/refresh-token-store";
import { addAuditLogEntry } from "../infra/audit-log-store";
import { registerUser } from "../use-cases/register-user";
import { loginUser } from "../use-cases/login-user";
import { findUserById } from "../infra/user-store";
import { requireAuth } from "./middleware";
import type { AuthUser } from "../domain/types";
import { createRateLimiter } from "../../../shared/rate-limit";

export const authRouter = Router();

const authLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 8,
  keyPrefix: "auth",
});

authRouter.post("/register", authLimiter, async (req, res, next) => {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid register input.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const passwordHash = await bcrypt.hash(validation.data.password, 10);
    const user = registerUser({
      email: validation.data.email,
      passwordHash,
    });

    addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.register",
      subject: user.email,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid login input.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const user = await loginUser(validation.data.email, validation.data.password);
    const token = issueAccessToken(user);
    const refreshToken = createRefreshToken(user.id);

    addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.login",
      subject: user.email,
    });

    res.json({
      ...token,
      refreshToken: refreshToken.token,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", (req, res, next) => {
  try {
    const validation = validateRefreshInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid refresh input.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const stored = findRefreshToken(validation.data.refreshToken);
    if (!stored || !isRefreshTokenActive(stored)) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Refresh token is invalid or expired.",
        type: "https://httpstatuses.com/401",
      });
    }

    const user = findUserById(stored.userId);
    if (!user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "User not found for refresh token.",
        type: "https://httpstatuses.com/401",
      });
    }

    const newRefreshToken = createRefreshToken(user.id);
    revokeRefreshToken(stored, newRefreshToken.token);
    const token = issueAccessToken(user);

    addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.refresh",
      subject: user.email,
    });

    res.json({
      ...token,
      refreshToken: newRefreshToken.token,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (req, res, next) => {
  try {
    const validation = validateRefreshInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid logout input.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const stored = findRefreshToken(validation.data.refreshToken);
    if (stored) {
      revokeRefreshToken(stored);
      const user = findUserById(stored.userId);
      if (user) {
        addAuditLogEntry({
          actorId: user.id,
          actorRole: user.role,
          action: "auth.logout",
          subject: user.email,
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

type AuthenticatedRequest = Request & { user?: AuthUser };

authRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    id: req.user?.id,
    email: req.user?.email,
    role: req.user?.role,
    createdAt: req.user?.createdAt?.toISOString(),
  });
});
