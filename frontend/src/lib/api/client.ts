import type { ApiResponse } from "@/types/api";

let accessToken: string | null = null;

type ApiClientOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

type ErrorResponse = {
  message?: string;
  error?: string;
};

type RefreshResponse =
  ApiResponse<{ accessToken: string }> | { accessToken: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { retryOnUnauthorized = true, headers, ...requestOptions } = options;
  const response = await fetch(buildUrl(endpoint), {
    ...requestOptions,
    credentials: "include",
    headers: buildHeaders(headers),
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiClient<T>(endpoint, {
        ...options,
        retryOnUnauthorized: false,
      });
    }

    clearAccessToken();
    redirectToLogin();
    throw new ApiError("Unauthorized", 401);
  }

  if (!response.ok) {
    throw await createApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function refreshAccessToken() {
  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as RefreshResponse;
  const token = getRefreshToken(payload);

  if (!token) {
    return false;
  }

  setAccessToken(token);
  return true;
}

function getRefreshToken(payload: RefreshResponse) {
  if ("data" in payload) {
    return payload.data.accessToken;
  }

  return payload.accessToken;
}

function buildUrl(endpoint: string) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${baseUrl}${path}`;
}

function buildHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);

  nextHeaders.set("Accept", "application/json");

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return nextHeaders;
}

async function createApiError(response: Response) {
  let message = response.statusText || "Request failed";

  try {
    const body = (await response.json()) as ErrorResponse;
    message = body.message ?? body.error ?? message;
  } catch {
    message = response.statusText || message;
  }

  return new ApiError(message, response.status);
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}
