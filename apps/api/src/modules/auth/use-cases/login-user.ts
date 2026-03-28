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

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const user = findUserByEmail(email);
  if (!user) {
    throw invalidCredentialsError();
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw invalidCredentialsError();
  }

  return user;
};
