import {
  Tabs,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useTheme,
} from "@/context/ThemeContext";

export default function TabsLayout() {
  const {
    colorScheme,
  } = useTheme();

  const isDark =
    colorScheme === "dark";

  const backgroundColor =
    isDark
      ? "#030712"
      : "#FFFFFF";

  const activeColor =
    isDark
      ? "#60A5FA"
      : "#1D4ED8";

  const inactiveColor =
    isDark
      ? "#6B7280"
      : "#9CA3AF";

  const borderColor =
    isDark
      ? "#1F2937"
      : "#E5E7EB";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          activeColor,

        tabBarInactiveTintColor:
          inactiveColor,

        tabBarStyle: {
          backgroundColor,
          borderTopColor:
            borderColor,
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="calendar-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",

          tabBarIcon: ({
            color,
            size,
          }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}