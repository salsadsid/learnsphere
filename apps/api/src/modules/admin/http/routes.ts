import { Router } from "express";
import type { Request } from "express";
import { AppError } from "../../../shared/errors";
import { requireAuth } from "../../auth/http/middleware";
import { requireRole } from "../../auth/http/roles";
import type { AuthUser } from "../../auth/domain/types";
import {
  resetUserPasswordService,
  listUsersService,
  updateUserRoleService,
  updateUserStatusService,
} from "./service";
import {
  validateListUsersInput,
  validateResetPasswordInput,
  validateUpdateRoleInput,
  validateUpdateStatusInput,
  validateUserIdParam,
} from "./validation";
import type { AdminUserListResponseDto, AdminUserDto } from "./dto";

type AuthenticatedRequest = Request & { user?: AuthUser };

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole({ roles: ["admin"] }));

adminRouter.get("/users", async (req, res, next) => {
  try {
    const validation = validateListUsersInput(req.query);
    if (!validation.isValid || !validation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid user query parameters.",
        errors: validation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const response: AdminUserListResponseDto = await listUsersService(validation.data);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/users/:userId/role", async (req: AuthenticatedRequest, res, next) => {
  try {
    const paramsValidation = validateUserIdParam(req.params);
    if (!paramsValidation.isValid || !paramsValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid user id.",
        errors: paramsValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const bodyValidation = validateUpdateRoleInput(req.body);
    if (!bodyValidation.isValid || !bodyValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid role update payload.",
        errors: bodyValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    if (req.user.id === paramsValidation.data.userId) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Admins cannot change their own role.",
        type: "https://httpstatuses.com/400",
      });
    }

    const response: AdminUserDto = await updateUserRoleService(
      req.user,
      paramsValidation.data.userId,
      bodyValidation.data.role
    );
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found.") {
      next(
        new AppError({
          status: 404,
          title: "Not Found",
          detail: "User not found.",
          type: "https://httpstatuses.com/404",
        })
      );
      return;
    }
    next(error);
  }
});

adminRouter.patch("/users/:userId/status", async (req: AuthenticatedRequest, res, next) => {
  try {
    const paramsValidation = validateUserIdParam(req.params);
    if (!paramsValidation.isValid || !paramsValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid user id.",
        errors: paramsValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const bodyValidation = validateUpdateStatusInput(req.body);
    if (!bodyValidation.isValid || !bodyValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid status update payload.",
        errors: bodyValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    if (req.user.id === paramsValidation.data.userId) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Admins cannot change their own status.",
        type: "https://httpstatuses.com/400",
      });
    }

    const response: AdminUserDto = await updateUserStatusService(
      req.user,
      paramsValidation.data.userId,
      bodyValidation.data.status === "active"
    );
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found.") {
      next(
        new AppError({
          status: 404,
          title: "Not Found",
          detail: "User not found.",
          type: "https://httpstatuses.com/404",
        })
      );
      return;
    }
    next(error);
  }
});

adminRouter.post("/users/:userId/password", async (req: AuthenticatedRequest, res, next) => {
  try {
    const paramsValidation = validateUserIdParam(req.params);
    if (!paramsValidation.isValid || !paramsValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid user id.",
        errors: paramsValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    const bodyValidation = validateResetPasswordInput(req.body);
    if (!bodyValidation.isValid || !bodyValidation.data) {
      throw new AppError({
        status: 400,
        title: "Validation Error",
        detail: "Invalid password payload.",
        errors: bodyValidation.errors,
        type: "https://httpstatuses.com/400",
      });
    }

    if (!req.user) {
      throw new AppError({
        status: 401,
        title: "Unauthorized",
        detail: "Missing user context.",
        type: "https://httpstatuses.com/401",
      });
    }

    const response: AdminUserDto = await resetUserPasswordService(
      req.user,
      paramsValidation.data.userId,
      bodyValidation.data
    );
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found.") {
      next(
        new AppError({
          status: 404,
          title: "Not Found",
          detail: "User not found.",
          type: "https://httpstatuses.com/404",
        })
      );
      return;
    }
    next(error);
  }
});
