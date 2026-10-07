import { apiRequest } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    token: string;
  };
}

interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(
  input: RegisterInput,
): Promise<{
  user: AuthUser;
  token: string;
}> {
  const response =
    await apiRequest<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return {
    user: response.data.user,
    token: response.data.token,
  };
}

export async function login(
  input: LoginInput,
): Promise<{
  user: AuthUser;
  token: string;
}> {
  const response =
    await apiRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return {
    user: response.data.user,
    token: response.data.token,
  };
}

export async function getMe(): Promise<AuthUser> {
  const response =
    await apiRequest<MeResponse>(
      "/auth/me",
    );

  return response.data.user;
}