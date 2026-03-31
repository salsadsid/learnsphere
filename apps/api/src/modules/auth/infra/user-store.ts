import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";
import type { AuthUser, UserRole } from "../domain/types";

type CreateUserInput = {
  email: string;
  passwordHash: string;
  role?: UserRole;
};

type AuthUserDocument = AuthUser;

const UserSchema = new Schema<AuthUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["student", "instructor", "admin"] },
    isActive: { type: Boolean, required: true, default: true },
    deactivatedAt: { type: Date },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const UserModel =
  (mongoose.models.AuthUser as mongoose.Model<AuthUserDocument> | undefined) ??
  mongoose.model<AuthUserDocument>("AuthUser", UserSchema);

const normalizeUser = (user: AuthUserDocument): AuthUser => ({
  ...user,
  isActive: user.isActive ?? true,
});

export const findUserByEmail = async (email: string): Promise<AuthUser | undefined> => {
  const normalized = email.toLowerCase().trim();
  const user = await UserModel.findOne({ email: normalized })
    .select("-__v -_id")
    .lean<AuthUserDocument>()
    .exec();
  return user ? normalizeUser(user) : undefined;
};

export const findUserById = async (id: string): Promise<AuthUser | undefined> => {
  const user = await UserModel.findOne({ id }).select("-__v -_id").lean<AuthUserDocument>().exec();
  return user ? normalizeUser(user) : undefined;
};

export const createUser = async ({ email, passwordHash, role }: CreateUserInput): Promise<AuthUser> => {
  const user: AuthUser = {
    id: randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: role ?? "student",
    isActive: true,
    createdAt: new Date(),
  };

  await UserModel.create(user);
  return user;
};

type ListUsersInput = {
  page: number;
  pageSize: number;
  q?: string;
  role?: UserRole;
  isActive?: boolean;
};

type ListUsersResult = {
  items: AuthUser[];
  total: number;
};

export const listUsers = async (input: ListUsersInput): Promise<ListUsersResult> => {
  const query: mongoose.FilterQuery<AuthUserDocument> = {};

  if (input.role) {
    query.role = input.role;
  }

  if (input.isActive !== undefined) {
    query.isActive = input.isActive;
  }

  if (input.q) {
    const term = input.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.email = new RegExp(term, "i");
  }

  const total = await UserModel.countDocuments(query).exec();
  const items = await UserModel.find(query)
    .sort({ createdAt: -1 })
    .skip((input.page - 1) * input.pageSize)
    .limit(input.pageSize)
    .select("-__v -_id")
    .lean<AuthUserDocument[]>()
    .exec();

  return { items: items.map(normalizeUser), total };
};

export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<AuthUser | undefined> => {
  const updated = await UserModel.findOneAndUpdate(
    { id: userId },
    { $set: { role } },
    { new: true }
  )
    .select("-__v -_id")
    .lean<AuthUserDocument>()
    .exec();

  return updated ? normalizeUser(updated) : undefined;
};

export const updateUserStatus = async (
  userId: string,
  isActive: boolean
): Promise<AuthUser | undefined> => {
  if (isActive) {
    const updated = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: { isActive }, $unset: { deactivatedAt: "" } },
      { new: true }
    )
      .select("-__v -_id")
      .lean<AuthUserDocument>()
      .exec();

    return updated ? normalizeUser(updated) : undefined;
  }

  const updated = await UserModel.findOneAndUpdate(
    { id: userId },
    { $set: { isActive, deactivatedAt: new Date() } },
    { new: true }
  )
    .select("-__v -_id")
    .lean<AuthUserDocument>()
    .exec();

  return updated ? normalizeUser(updated) : undefined;
};

export const updateUserPassword = async (
  userId: string,
  passwordHash: string
): Promise<AuthUser | undefined> => {
  const updated = await UserModel.findOneAndUpdate(
    { id: userId },
    { $set: { passwordHash } },
    { new: true }
  )
    .select("-__v -_id")
    .lean<AuthUserDocument>()
    .exec();

  return updated ? normalizeUser(updated) : undefined;
};
