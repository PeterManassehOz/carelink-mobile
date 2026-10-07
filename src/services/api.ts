import { getAuthToken } from "@/utils/authStorage";

const API_BASE_URL =
  "http://10.232.58.60:5000/api/v1";

export const AUTH_TOKEN_KEY =
  "carelink_auth_token";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(
    message = "Unable to connect to the server. Please check your internet connection and try again.",
  ) {
    super(message);

    this.name = "NetworkError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    await getAuthToken(
      AUTH_TOKEN_KEY,
    );

  const headers = new Headers(
    options?.headers,
  );

  headers.set(
    "Content-Type",
    "application/json",
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );
  } catch (error) {
    console.error(
      "API network error:",
      error,
    );

    throw new NetworkError();
  }

  let data: {
    success?: boolean;
    message?: string;
    code?: string;
  } | null = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message ||
        "Something went wrong. Please try again.",
      response.status,
      data?.code,
    );
  }

  return data as T;
}