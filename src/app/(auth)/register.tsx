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

export default function RegisterScreen() {
  const router = useRouter();

  const {
    redirect,
  } = useLocalSearchParams<{
    redirect?: string;
  }>();

  const {
    register,
  } = useAuth();

  const emailInputRef =
    useRef<TextInput>(null);

  const phoneInputRef =
    useRef<TextInput>(null);

  const passwordInputRef =
    useRef<TextInput>(null);

  const confirmPasswordInputRef =
    useRef<TextInput>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleRegister(): Promise<void> {
    setError(null);

    if (!name.trim()) {
      setError(
        "Please enter your name.",
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone:
          phone.trim() ||
          undefined,
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
        "Registration failed:",
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
        error.status === 409
      ) {
        setError(
          "An account with this email already exists.",
        );
      } else {
        setError(
          "Unable to create your account right now. Please try again.",
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
        <View className="flex-1 px-6 py-10">
          <View className="mb-8 items-center">
            <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 dark:bg-blue-600">
              <Ionicons name="person-add" size={28} color="#FFFFFF" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </Text>

            <Text className="mt-2 text-center text-base leading-6 text-gray-600 dark:text-gray-400">
              Create a CareLink account to book and manage appointments.
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
              label="Full name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              editable={!isSubmitting}
              returnKeyType="next"
              onSubmitEditing={() =>
                emailInputRef.current?.focus()
              }
            />

            <AppInput
              ref={emailInputRef}
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
                phoneInputRef.current?.focus()
              }
            />

            <AppInput
              ref={phoneInputRef}
              label="Phone"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="Optional"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="tel"
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
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!isSubmitting}
              returnKeyType="next"
              onSubmitEditing={() =>
                confirmPasswordInputRef.current?.focus()
              }
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

            <AppInput
              ref={confirmPasswordInputRef}
              label="Confirm password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={
                handleRegister
              }
              rightElement={
                <Pressable
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  className="px-4 active:opacity-70"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={19}
                    color="#9CA3AF"
                  />
                </Pressable>
              }
            />

            <AppButton
              title="Create account"
              icon="checkmark-circle-outline"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleRegister}
              className="mt-2"
            />
          </View>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
            </Text>

            <Link
              href={{
                pathname:
                  "/(auth)/login",
                params:
                  redirect
                    ? { redirect }
                    : undefined,
              }}
              asChild
            >
              <Pressable>
                <Text className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  Log in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}