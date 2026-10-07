import { apiRequest } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileResponse {
  success: boolean;
  data: {
    user: UserProfile;
  };
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const response =
    await apiRequest<UserProfileResponse>(
      "/users/me",
    );

  return response.data.user;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const response =
    await apiRequest<UserProfileResponse>(
      "/users/me",
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );

  return response.data.user;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<void> {
  await apiRequest<{
    success: boolean;
    message: string;
  }>(
    "/users/me/password",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}