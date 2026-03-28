import { randomUUID } from "crypto";
import type { AuthUser, UserRole } from "../domain/types";

const users: AuthUser[] = [];

type CreateUserInput = {
  email: string;
  passwordHash: string;
  role?: UserRole;
};

export const findUserByEmail = (email: string): AuthUser | undefined =>
  users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const findUserById = (id: string): AuthUser | undefined =>
  users.find((user) => user.id === id);

export const createUser = ({ email, passwordHash, role }: CreateUserInput): AuthUser => {
  const user: AuthUser = {
    id: randomUUID(),
    email,
    passwordHash,
    role: role ?? "student",
    createdAt: new Date(),
  };

  users.push(user);
  return user;
};
