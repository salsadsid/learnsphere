import type { NextFunction, Request, Response } from "express";
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
import type { AuthUser } from "../domain/types";
import type {
  LoginResponseDto,
  MeResponseDto,
  ProfileResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from "./dto";

type AuthenticatedRequest = Request & { user?: AuthUser };

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
    const refreshToken = createRefreshToken(user.id);

    addAuditLogEntry({
      actorId: user.id,
      actorRole: user.role,
      action: "auth.login",
      subject: user.email,
    });

    const response: LoginResponseDto = {
      ...token,
      refreshToken: refreshToken.token,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = (req: Request, res: Response, next: NextFunction) => {
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

    const response: RefreshResponseDto = {
      ...token,
      refreshToken: newRefreshToken.token,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = (req: Request, res: Response, next: NextFunction) => {
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
};

export const revokeHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateRefreshInput(req.body);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid revoke input.",
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
