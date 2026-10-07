import {
  useRef,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import type {
  TextInput,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useRouter,
} from "expo-router";

import {
  useAuth,
} from "@/context/AuthContext";

import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";

export default function ChangePasswordScreen() {
  const router = useRouter();

  const {
    changePassword,
  } = useAuth();

  const newPasswordInputRef =
    useRef<TextInput>(null);

  const confirmPasswordInputRef =
    useRef<TextInput>(null);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  async function handleChangePassword(): Promise<void> {
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError(
        "Current password is required.",
      );
      return;
    }

    if (!newPassword) {
      setError(
        "New password is required.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters.",
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New passwords do not match.",
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setError(
        "New password must be different from your current password.",
      );
      return;
    }

    try {
      setIsSaving(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        "Your password has been changed successfully.",
      );

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to change your password.",
      );
    } finally {
      setIsSaving(false);
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <View className="items-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 dark:bg-blue-600">
            <Ionicons
              name="key-outline"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <Text className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
            Change password
          </Text>

          <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
            Update your password to keep your account secure.
          </Text>
        </View>

        {error && (
          <View className="mt-6 flex-row items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
            <Ionicons
              name="alert-circle"
              size={18}
              color="#DC2626"
              style={{
                marginTop: 1,
              }}
            />

            <Text className="flex-1 text-sm leading-5 text-red-700 dark:text-red-300">
              {error}
            </Text>
          </View>
        )}

        {success && (
          <View className="mt-6 flex-row items-start gap-2.5 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/60 dark:bg-green-950/40">
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#16A34A"
              style={{
                marginTop: 1,
              }}
            />

            <Text className="flex-1 text-sm leading-5 text-green-700 dark:text-green-300">
              {success}
            </Text>
          </View>
        )}

        <View className="mt-8 gap-5">
          <AppInput
            label="Current password"
            icon="lock-closed-outline"
            value={currentPassword}
            onChangeText={
              setCurrentPassword
            }
            placeholder="Enter current password"
            secureTextEntry={
              !showCurrentPassword
            }
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="next"
            editable={!isSaving}
            onSubmitEditing={() =>
              newPasswordInputRef.current?.focus()
            }
            rightElement={
              <Pressable
                onPress={() =>
                  setShowCurrentPassword(
                    (value) =>
                      !value,
                  )
                }
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                className="px-4 active:opacity-70"
              >
                <Ionicons
                  name={
                    showCurrentPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={19}
                  color="#9CA3AF"
                />
              </Pressable>
            }
          />

          <View>
            <AppInput
              ref={
                newPasswordInputRef
              }
              label="New password"
              icon="lock-closed-outline"
              value={newPassword}
              onChangeText={
                setNewPassword
              }
              placeholder="Enter new password"
              secureTextEntry={
                !showNewPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="next"
              editable={!isSaving}
              onSubmitEditing={() =>
                confirmPasswordInputRef.current?.focus()
              }
              rightElement={
                <Pressable
                  onPress={() =>
                    setShowNewPassword(
                      (value) =>
                        !value,
                    )
                  }
                  disabled={isSaving}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  className="px-4 active:opacity-70"
                >
                  <Ionicons
                    name={
                      showNewPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={19}
                    color="#9CA3AF"
                  />
                </Pressable>
              }
            />

            <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Use at least 8 characters.
            </Text>
          </View>

          <AppInput
            ref={
              confirmPasswordInputRef
            }
            label="Confirm new password"
            icon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            placeholder="Confirm new password"
            secureTextEntry={
              !showConfirmPassword
            }
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="done"
            editable={!isSaving}
            onSubmitEditing={
              handleChangePassword
            }
            rightElement={
              <Pressable
                onPress={() =>
                  setShowConfirmPassword(
                    (value) =>
                      !value,
                  )
                }
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
                className="px-4 active:opacity-70"
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={19}
                  color="#9CA3AF"
                />
              </Pressable>
            }
          />

          <AppButton
            title="Change password"
            icon="checkmark-circle-outline"
            loading={isSaving}
            disabled={isSaving}
            onPress={
              handleChangePassword
            }
            className="mt-2"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}