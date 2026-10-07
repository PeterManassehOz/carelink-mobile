import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Platform,
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

export default function EditProfileScreen() {
  const router = useRouter();

  const {
    user,
    updateUser,
  } = useAuth();

  const emailInputRef =
    useRef<TextInput>(null);

  const phoneInputRef =
    useRef<TextInput>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
  }, [user]);

  async function handleSave(): Promise<void> {
    setError(null);

    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim();

    const trimmedPhone =
      phone.trim();

    if (!trimmedName) {
      setError(
        "Name is required.",
      );
      return;
    }

    if (trimmedName.length < 2) {
      setError(
        "Name must be at least 2 characters.",
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Email is required.",
      );
      return;
    }

    try {
      setIsSaving(true);

      await updateUser({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      router.back();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return null;
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
              name="person-outline"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <Text className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
            Edit profile
          </Text>

          <Text className="mt-2 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
            Keep your personal information up to date.
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

        <View className="mt-8 gap-5">
          <AppInput
            label="Full name"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            returnKeyType="next"
            editable={!isSaving}
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
            returnKeyType="next"
            editable={!isSaving}
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
            autoComplete="tel"
            returnKeyType="done"
            editable={!isSaving}
            onSubmitEditing={
              handleSave
            }
          />

          <AppButton
            title="Save changes"
            icon="checkmark-circle-outline"
            loading={isSaving}
            disabled={isSaving}
            onPress={handleSave}
            className="mt-2"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}