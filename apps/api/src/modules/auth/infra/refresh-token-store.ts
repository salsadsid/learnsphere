import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";

export type RefreshTokenRecord = {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
};

const REFRESH_TOKEN_TTL_DAYS = 7;

const now = () => new Date();

const RefreshTokenSchema = new Schema<RefreshTokenRecord>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByToken: { type: String },
  },
  { versionKey: false }
);

const RefreshTokenModel =
  (mongoose.models.RefreshToken as mongoose.Model<RefreshTokenRecord> | undefined) ??
  mongoose.model<RefreshTokenRecord>("RefreshToken", RefreshTokenSchema);

export const createRefreshToken = async (userId: string): Promise<RefreshTokenRecord> => {
  const token = randomUUID();
  const createdAt = now();
  const expiresAt = new Date(createdAt.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const record: RefreshTokenRecord = {
    token,
    userId,
    createdAt,
    expiresAt,
  };

  await RefreshTokenModel.create(record);
  return record;
};

export const findRefreshToken = async (
  token: string
): Promise<RefreshTokenRecord | undefined> => {
  const record = await RefreshTokenModel.findOne({ token })
    .select("-__v -_id")
    .lean<RefreshTokenRecord>()
    .exec();
  return record ?? undefined;
};

export const revokeRefreshToken = async (
  record: RefreshTokenRecord,
  replacedByToken?: string
): Promise<void> => {
  if (record.revokedAt) {
    return;
  }

  const revokedAt = now();
  const next: Partial<RefreshTokenRecord> = {
    revokedAt,
    ...(replacedByToken !== undefined ? { replacedByToken } : {}),
  };

  await RefreshTokenModel.updateOne({ token: record.token }, { $set: next }).exec();
  record.revokedAt = revokedAt;
  if (replacedByToken !== undefined) {
    record.replacedByToken = replacedByToken;
  }
};

export const isRefreshTokenActive = (record: RefreshTokenRecord): boolean =>
  record.revokedAt === undefined && record.expiresAt > now();
