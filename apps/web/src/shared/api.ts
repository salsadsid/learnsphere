import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/shared/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
  headers?: Record<string, string>;
};

const extractError = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") {
    return "Request failed.";
  }

  if ("detail" in payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  if ("title" in payload && typeof payload.title === "string") {
    return payload.title;
  }

  return "Request failed.";
};

const parsePayload = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  return response.json().catch(() => null);
};

const parseTextPayload = async (response: Response): Promise<string> =>
  response.text().catch(() => "");

const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await parsePayload(response);
  if (!response.ok || !payload || typeof payload !== "object") {
    clearTokens();
    return false;
  }

  if (!("accessToken" in payload) || !("refreshToken" in payload)) {
    clearTokens();
    return false;
  }

  const accessToken = String(payload.accessToken);
  const nextRefreshToken = String(payload.refreshToken);

  if (!accessToken || !nextRefreshToken) {
    clearTokens();
    return false;
  }

  setTokens({ accessToken, refreshToken: nextRefreshToken });
  return true;
};

const requestJson = async <T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  if (options.body !== undefined && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await parsePayload(response);

  if (response.ok) {
    return {
      ok: true,
      status: response.status,
      data: payload as T,
    };
  }

  if (response.status === 401 && options.auth && !options.skipRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return requestJson<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (response.status === 401 && options.auth) {
    clearTokens();
  }

  return {
    ok: false,
    status: response.status,
    error: extractError(payload),
  };
};

const requestText = async (path: string, options: RequestOptions = {}): Promise<ApiResponse<string>> => {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  if (options.body !== undefined && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.ok) {
    const payload = await parseTextPayload(response);
    return {
      ok: true,
      status: response.status,
      data: payload,
    };
  }

  if (response.status === 401 && options.auth && !options.skipRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return requestText(path, { ...options, skipRefresh: true });
    }
  }

  if (response.status === 401 && options.auth) {
    clearTokens();
  }

  const payload = await parsePayload(response);

  return {
    ok: false,
    status: response.status,
    error: extractError(payload),
  };
};

export const getJson = async <T>(path: string): Promise<ApiResponse<T>> =>
  requestJson<T>(path);

export const postJson = async <T>(
  path: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => requestJson<T>(path, { ...options, method: "POST", body });

export const authGetJson = async <T>(path: string): Promise<ApiResponse<T>> =>
  requestJson<T>(path, { method: "GET", auth: true });

export const authPostJson = async <T>(
  path: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => requestJson<T>(path, { ...options, method: "POST", body, auth: true });

export const authPatchJson = async <T>(
  path: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => requestJson<T>(path, { ...options, method: "PATCH", body, auth: true });

export const authDeleteJson = async <T>(path: string): Promise<ApiResponse<T>> =>
  requestJson<T>(path, { method: "DELETE", auth: true });

export const authGetText = async (path: string): Promise<ApiResponse<string>> =>
  requestText(path, { method: "GET", auth: true });
