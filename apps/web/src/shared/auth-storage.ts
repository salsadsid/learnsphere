const ACCESS_TOKEN_KEY = "ls_access_token";
const REFRESH_TOKEN_KEY = "ls_refresh_token";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

const isBrowser = (): boolean => typeof window !== "undefined";

export const getAccessToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (tokens: TokenPair): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearTokens = (): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
