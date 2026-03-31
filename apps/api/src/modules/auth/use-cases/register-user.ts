import { AppError } from "../../../shared/errors";
import type { AuthUser, UserRole } from "../domain/types";
import { createUser, findUserByEmail } from "../infra/user-store";

type RegisterUserInput = {
  email: string;
  passwordHash: string;
  role?: UserRole;
};

export const registerUser = async ({
  email,
  passwordHash,
  role,
}: RegisterUserInput): Promise<AuthUser> => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError({
      status: 409,
      title: "Conflict",
      detail: "Email is already registered.",
      type: "https://httpstatuses.com/409",
    });
  }

  return createUser({
    email,
    passwordHash,
    ...(role !== undefined ? { role } : {}),
  });
};
