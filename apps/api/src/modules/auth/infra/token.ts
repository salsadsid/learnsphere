import jwt from "jsonwebtoken";
import { config } from "../../../shared/config";
import type { AuthUser } from "../domain/types";

type AccessTokenResult = {
  accessToken: string;
  expiresInSeconds: number;
};

const ACCESS_TOKEN_EXPIRES_SECONDS = 60 * 60;

export const issueAccessToken = (user: AuthUser): AccessTokenResult => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS,
  });

  return { accessToken, expiresInSeconds: ACCESS_TOKEN_EXPIRES_SECONDS };
};
