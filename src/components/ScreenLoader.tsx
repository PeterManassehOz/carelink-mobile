import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

interface ScreenLoaderProps {
  message?: string;
}

export default function ScreenLoader({
  message = "Loading...",
}: ScreenLoaderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-gray-950">
      <ActivityIndicator
        size="large"
        color="#2563EB"
      />

      <Text className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
        {message}
      </Text>
    </View>
  );
}