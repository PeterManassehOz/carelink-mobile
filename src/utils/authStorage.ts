import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function getAuthToken(
  key: string,
): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(
        "Failed to read authentication token from local storage:",
        error,
      );

      return null;
    }
  }

  return SecureStore.getItemAsync(key);
}

export async function setAuthToken(
  key: string,
  token: string,
): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, token);
    } catch (error) {
      console.error(
        "Failed to save authentication token to local storage:",
        error,
      );
    }

    return;
  }

  await SecureStore.setItemAsync(
    key,
    token,
  );
}

export async function deleteAuthToken(
  key: string,
): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        "Failed to remove authentication token from local storage:",
        error,
      );
    }

    return;
  }

  await SecureStore.deleteItemAsync(key);
}