import type { NextFunction, Request, Response } from "express";
import type { AuthUser, UserRole } from "../domain/types";
import { AppError } from "../../../shared/errors";

type AuthenticatedRequest = Request & { user?: AuthUser };

type RequireRoleOptions = {
  roles: UserRole[];
};

const forbiddenError = () =>
  new AppError({
    status: 403,
    title: "Forbidden",
    detail: "You do not have permission to perform this action.",
    type: "https://httpstatuses.com/403",
  });

export const requireRole = ({ roles }: RequireRoleOptions) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      next(forbiddenError());
      return;
    }

    next();
  };
};
