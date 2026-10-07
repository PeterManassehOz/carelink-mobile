import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  Link,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  useRef,
  useState,
} from "react";

import type { TextInput } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";

import {
  ApiError,
  NetworkError,
} from "@/services/api";

import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";

export default function LoginScreen() {
  const router = useRouter();

  const {
    redirect,
  } = useLocalSearchParams<{
    redirect?: string;
  }>();

  const {
    login,
  } = useAuth();

  const passwordInputRef =
    useRef<TextInput>(null);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleLogin(): Promise<void> {
    setError(null);

    if (!email.trim()) {
      setError(
        "Please enter your email.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await login({
        email: email.trim(),
        password,
      });

      const destination =
        typeof redirect === "string" &&
        redirect.length > 0
          ? redirect
          : "/";

      router.replace(
        destination as never,
      );
    } catch (error) {
      console.error(
        "Login failed:",
        error,
      );

      if (
        error instanceof NetworkError
      ) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setError(
          "Incorrect email or password.",
        );
      } else {
        setError(
          "Unable to log in right now. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-950"
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-10">
          <View className="mb-10 items-center">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 dark:bg-blue-600">
              <Ionicons name="heart" size={30} color="#FFFFFF" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-gray-600 dark:text-gray-400">
              Log in to your CareLink account to continue.
            </Text>
          </View>

          {error && (
            <View className="mb-5 flex-row items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#DC2626"
                style={{ marginTop: 1 }}
              />
              <Text className="flex-1 text-sm leading-5 text-red-700 dark:text-red-300">
                {error}
              </Text>
            </View>
          )}

          <View className="gap-5">
            <AppInput
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isSubmitting}
              returnKeyType="next"
              onSubmitEditing={() =>
                passwordInputRef.current?.focus()
              }
            />

            <AppInput
              ref={passwordInputRef}
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              rightElement={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  className="px-4 active:opacity-70"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={19}
                    color="#9CA3AF"
                  />
                </Pressable>
              }
            />

            <AppButton
              title="Log in"
              icon="log-in-outline"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleLogin}
              className="mt-2"
            />
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
            </Text>

            <Link
              href={{
                pathname:
                  "/(auth)/register",
                params:
                  redirect
                    ? { redirect }
                    : undefined,
              }}
              asChild
            >
              <Pressable>
                <Text className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  Create one
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}