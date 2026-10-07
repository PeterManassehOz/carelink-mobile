import {
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AppButton from "@/components/AppButton";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <View className="items-center px-6 py-12">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
        <Ionicons name="cloud-offline-outline" size={26} color="#DC2626" />
      </View>

      <Text className="text-center text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </Text>

      <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
        {message}
      </Text>

      {onRetry && (
        <AppButton
          title={retryLabel}
          icon="refresh-outline"
          onPress={onRetry}
          className="mt-5 min-h-0 px-6 py-3"
        />
      )}
    </View>
  );
}