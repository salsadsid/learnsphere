import { randomUUID } from "crypto";

export type RefreshTokenRecord = {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
};

const tokens: RefreshTokenRecord[] = [];
const REFRESH_TOKEN_TTL_DAYS = 7;

const now = () => new Date();

export const createRefreshToken = (userId: string): RefreshTokenRecord => {
  const token = randomUUID();
  const createdAt = now();
  const expiresAt = new Date(createdAt.getTime() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const record: RefreshTokenRecord = {
    token,
    userId,
    createdAt,
    expiresAt,
  };

  tokens.push(record);
  return record;
};

export const findRefreshToken = (token: string): RefreshTokenRecord | undefined =>
  tokens.find((record) => record.token === token);

export const revokeRefreshToken = (record: RefreshTokenRecord, replacedByToken?: string): void => {
  if (record.revokedAt) {
    return;
  }

  record.revokedAt = now();
  if (replacedByToken !== undefined) {
    record.replacedByToken = replacedByToken;
  }
};

export const isRefreshTokenActive = (record: RefreshTokenRecord): boolean =>
  record.revokedAt === undefined && record.expiresAt > now();
