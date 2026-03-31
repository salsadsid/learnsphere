import bcrypt from "bcryptjs";
import { AppError } from "../../../shared/errors";
import { registerUser } from "./register-user";

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
    console.warn("Admin seed skipped: ADMIN_EMAIL and ADMIN_PASSWORD must both be set.");
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.warn(
      `Admin seed skipped: ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    registerUser({ email, passwordHash, role: "admin" });
    console.log(`Admin account seeded for ${email}.`);
  } catch (error) {
    if (error instanceof AppError && error.status === 409) {
      console.log(`Admin account already exists for ${email}.`);
      return;
    }

    throw error;
  }
};
