import bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors";
import { registerUser } from "./register-user";
import { createChildLogger } from "../../../shared/logger";

const log = createChildLogger({ module: "seed-admin" });

type SeedAdminInput = {
  email?: string;
  password?: string;
};

const MIN_PASSWORD_LENGTH = 8;

export const seedAdmin = async ({ email, password }: SeedAdminInput): Promise<void> => {
  if (!email && !password) {
    return;
  }

  if (!email || !password) {
    log.warn("admin seed skipped: ADMIN_EMAIL and ADMIN_PASSWORD must both be set");
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    log.warn({ minLength: MIN_PASSWORD_LENGTH }, "admin seed skipped: password too short");
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await registerUser({ email, passwordHash, role: "admin" });
    log.info({ email }, "admin account seeded");
  } catch (error) {
    if (error instanceof AppError && error.status === 409) {
      log.info({ email }, "admin account already exists");
      return;
    }

    throw error;
  }
};
