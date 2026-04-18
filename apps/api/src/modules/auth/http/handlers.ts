import type { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors";
import { validateLoginInput, validateRegisterInput } from "./validation";
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
import type { AuthUser } from "../domain/types";
import type {
  LoginResponseDto,
  MeResponseDto,
  ProfileResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from "./dto";
import { setAuthCookies, clearAuthCookies } from "../infra/cookies";

type AuthenticatedRequest = Request & { user?: AuthUser };

function extractRefreshToken(req: Request): string | null {
  if (typeof req.body?.refreshToken === "string" && req.body.refreshToken.length > 0) {
    return req.body.refreshToken;
  }
  const cookie = req.cookies?.refresh_token;
  if (typeof cookie === "string" && cookie.length > 0) {
    return cookie;
  }
  return null;
}

const buildUserResponse = (user?: AuthUser): MeResponseDto => ({
  id: user?.id ?? "",
  email: user?.email ?? "",
  role: user?.role ?? "student",
  createdAt: user?.createdAt?.toISOString() ?? "",
});

export const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    const user = await registerUser({
      email: validation.data.email,
      passwordHash,
    });

    await addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.register",
      subject: user.email,
    });

    const response: RegisterResponseDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    const refreshToken = await createRefreshToken(user.id);

    await addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.login",
      subject: user.email,
    });

    setAuthCookies(res, token.accessToken, refreshToken.token);

    const response: LoginResponseDto = {
      ...token,
      refreshToken: refreshToken.token,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshTokenValue = extractRefreshToken(req);
    if (!refreshTokenValue) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Refresh token is missing.",
        type: "https://httpstatuses.com/401",
      });
    }

    const stored = await findRefreshToken(refreshTokenValue);
    if (!stored || !isRefreshTokenActive(stored)) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Refresh token is invalid or expired.",
        type: "https://httpstatuses.com/401",
      });
    }

    const user = await findUserById(stored.userId);
    if (!user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "User not found for refresh token.",
        type: "https://httpstatuses.com/401",
      });
    }

    if (!user.isActive) {
      throw new AppError({
        status: 403,
        title: "Forbidden",
        detail: "Account is deactivated.",
        type: "https://httpstatuses.com/403",
      });
    }

    const newRefreshToken = await createRefreshToken(user.id);
    await revokeRefreshToken(stored, newRefreshToken.token);
    const token = issueAccessToken(user);

    await addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.refresh",
      subject: user.email,
    });

    setAuthCookies(res, token.accessToken, newRefreshToken.token);

    const response: RefreshResponseDto = {
      ...token,
      refreshToken: newRefreshToken.token,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractRefreshToken(req);
    const stored = token ? await findRefreshToken(token) : null;
    if (stored) {
      await revokeRefreshToken(stored);
      const user = await findUserById(stored.userId);
      if (user) {
        await addAuditLogEntry({
          actorId: user.id,
          actorRole: user.role,
          action: "auth.logout",
          subject: user.email,
        });
      }
    }

    clearAuthCookies(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const revokeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractRefreshToken(req);
    const stored = token ? await findRefreshToken(token) : null;
    if (stored) {
      await revokeRefreshToken(stored);
      const user = await findUserById(stored.userId);
      if (user) {
        await addAuditLogEntry({
          actorId: user.id,
          actorRole: user.role,
          action: "auth.revoke",
          subject: user.email,
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const meHandler = (req: AuthenticatedRequest, res: Response) => {
  res.json(buildUserResponse(req.user));
};

export const profileHandler = (req: AuthenticatedRequest, res: Response) => {
  const response: ProfileResponseDto = buildUserResponse(req.user);
  res.json(response);
};
