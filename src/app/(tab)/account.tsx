import {
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useRouter,
} from "expo-router";

import AppButton from "@/components/AppButton";

export default function AccountScreen() {
  const router = useRouter();

  const {
    user,
    logout,
  } = useAuth();

  function handleLogout(): void {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out of CareLink?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error(
                "Logout failed:",
                error,
              );

              Alert.alert(
                "Logout failed",
                "Unable to log out. Please try again.",
              );
            }
          },
        },
      ],
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map(
          (part) => part[0],
        )
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-950"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      <Text className="text-3xl font-bold text-gray-900 dark:text-white">
        Account
      </Text>

      <Text className="mt-2 text-base leading-6 text-gray-600 dark:text-gray-400">
        Manage your CareLink account.
      </Text>

      {/* Profile */}
      <View className="mt-8">
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons
            name="person-circle-outline"
            size={17}
            color="#6B7280"
          />

          <Text className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Profile
          </Text>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <View className="mb-5 flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-700 dark:bg-blue-600">
              <Text className="text-xl font-bold text-white">
                {initials}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.name ??
                  "Not available"}
              </Text>

              <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {user?.email ??
                  "Not available"}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-5 dark:border-gray-800">
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="call-outline"
                size={18}
                color="#6B7280"
              />

              <View>
                <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Phone
                </Text>

                <Text className="mt-0.5 text-base text-gray-800 dark:text-gray-200">
                  {user?.phone ||
                    "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          <AppButton
            title="Edit profile"
            icon="create-outline"
            onPress={() =>
              router.push(
                "/edit-profile",
              )
            }
            className="mt-6"
          />

          <AppButton
            title="Change password"
            icon="key-outline"
            variant="secondary"
            onPress={() =>
              router.push(
                "/change-password",
              )
            }
            className="mt-3"
          />
        </View>
      </View>

      {/* Authentication */}
      <View className="mt-8">
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons
            name="shield-outline"
            size={17}
            color="#6B7280"
          />

          <Text className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Authentication
          </Text>
        </View>

        <AppButton
          title="Log out"
          icon="log-out-outline"
          variant="danger"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}