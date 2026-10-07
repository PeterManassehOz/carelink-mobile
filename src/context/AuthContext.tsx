import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getMe,
  login as loginUser,
  register as registerUser,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@/services/auth.service";

import {
  changePassword as changePasswordRequest,
  updateProfile,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/services/user.service";

import {
  AUTH_TOKEN_KEY,
} from "@/services/api";

import {
  deleteAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/utils/authStorage";


interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  register: (
    input: RegisterInput,
  ) => Promise<void>;

  login: (
    input: LoginInput,
  ) => Promise<void>;

  updateUser: (
    input: UpdateProfileInput,
  ) => Promise<void>;

  changePassword: (
    input: ChangePasswordInput,
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession(): Promise<void> {
    try {
      const token =
        await getAuthToken(
          AUTH_TOKEN_KEY,
        );

      if (!token) {
        return;
      }

      const currentUser =
        await getMe();

      setUser(currentUser);
    } catch (error) {
      console.error(
        "Failed to restore authentication session:",
        error,
      );

      await deleteAuthToken(
        AUTH_TOKEN_KEY,
      );

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    input: RegisterInput,
  ): Promise<void> {
    const {
      user: registeredUser,
      token,
    } = await registerUser(input);

    await setAuthToken(
      AUTH_TOKEN_KEY,
      token,
    );

    setUser(registeredUser);
  }

  async function login(
    input: LoginInput,
  ): Promise<void> {
    const {
      user: loggedInUser,
      token,
    } = await loginUser(input);

    await setAuthToken(
      AUTH_TOKEN_KEY,
      token,
    );

    setUser(loggedInUser);
  }

  async function updateUser(
    input: UpdateProfileInput,
  ): Promise<void> {
    const updatedUser =
      await updateProfile(input);

    setUser({
      ...updatedUser,
    });
  }

  async function handleChangePassword(
    input: ChangePasswordInput,
  ): Promise<void> {
    await changePasswordRequest(input);
  }

  async function logout(): Promise<void> {
    await deleteAuthToken(
      AUTH_TOKEN_KEY,
    );

    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated:
      user !== null,
    register,
    login,
    updateUser,
    changePassword: handleChangePassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}