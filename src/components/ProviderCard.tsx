import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { Provider } from "@/services/provider.service";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({
  provider,
}: ProviderCardProps) {
  const router = useRouter();

  function handlePress() {
    if (!provider.id) {
      console.error(
        "Cannot open provider: provider ID is missing",
      );
      return;
    }

    router.push({
      pathname: "/providers/[id]",
      params: {
        id: provider.id,
      },
    });
  }

  return (
    <Pressable
      onPress={handlePress}
      className="
        mb-4
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
        active:opacity-70
        dark:border-gray-800
        dark:bg-gray-900
      "
    >
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
          <Ionicons name="medkit-outline" size={20} color="#1D4ED8" />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {provider.name}
          </Text>

          <Text className="mt-0.5 text-sm font-medium text-blue-700 dark:text-blue-400">
            {provider.specialty}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9CA3AF"
          style={{ marginTop: 4 }}
        />
      </View>

      <Text className="mt-3 text-sm leading-5 text-gray-600 dark:text-gray-400" numberOfLines={2}>
        {provider.description}
      </Text>

      <View className="mt-3 flex-row items-center gap-1.5">
        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {provider.location}
        </Text>
      </View>
    </Pressable>
  );
}