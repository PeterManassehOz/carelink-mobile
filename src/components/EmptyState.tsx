import {
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function EmptyState({
  title,
  message,
  icon = "folder-open-outline",
}: EmptyStateProps) {
  return (
    <View className="items-center px-6 py-12">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <Ionicons name={icon} size={26} color="#9CA3AF" />
      </View>

      <Text className="text-center text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </Text>

      <Text className="mt-2 text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
        {message}
      </Text>
    </View>
  );
}