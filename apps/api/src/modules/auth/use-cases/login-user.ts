import * as bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors";
import type { AuthUser } from "../domain/types";
import { findUserByEmail } from "../infra/user-store";

const invalidCredentialsError = () =>
  new AppError({
    status: 401,
    title: "Unauthorized",
    detail: "Invalid email or password.",
    type: "https://httpstatuses.com/401",
  });

const inactiveAccountError = () =>
  new AppError({
    status: 403,
    title: "Forbidden",
    detail: "Account is deactivated.",
    type: "https://httpstatuses.com/403",
  });

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw invalidCredentialsError();
  }

  if (!user.isActive) {
    throw inactiveAccountError();
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw invalidCredentialsError();
  }

  return user;
};
