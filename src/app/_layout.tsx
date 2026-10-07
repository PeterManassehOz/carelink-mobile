import { useEffect } from "react";

import {
  Redirect,
  Stack,
  usePathname,
  useSegments,
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";

import { Ionicons } from "@expo/vector-icons";

import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  StatusBar as RNStatusBar,
} from "react-native";

import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import "../global.css";

import {
  ThemeProvider,
  useTheme,
  type ThemeMode,
} from "@/context/ThemeContext";

import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const {
    colorScheme,
    theme,
    setTheme,
  } = useTheme();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const segments = useSegments();
  const pathname = usePathname();

  const isDark =
    colorScheme === "dark";

  const backgroundColor = isDark
    ? "#030712"
    : "#FFFFFF";

  const textColor = isDark
    ? "#F9FAFB"
    : "#111827";

  const isProtectedRoute =
    (segments[0] === "(tab)" &&
      (segments[1] === "appointments" ||
        segments[1] === "account")) ||
    segments[0] === "appointments" ||
    segments[0] === "booking" ||
    segments[0] === "edit-profile" ||
    segments[0] === "change-password";

  const isAuthRoute =
    segments[0] === "(auth)";

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  let redirectElement = null;

  if (!isLoading) {
    if (
      !isAuthenticated &&
      isProtectedRoute
    ) {
      redirectElement = (
        <Redirect
          href={{
            pathname: "/(auth)/login",
            params: {
              redirect: pathname,
            },
          }}
        />
      );
    } else if (
      isAuthenticated &&
      isAuthRoute
    ) {
      redirectElement = (
        <Redirect href="/(tab)" />
      );
    }
  }

  return (
    <>
      {Platform.OS === "android" && (
        <RNStatusBar
          backgroundColor={
            backgroundColor
          }
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
        />
      )}

      <ExpoStatusBar
        style={
          isDark
            ? "light"
            : "dark"
        }
      />

      {redirectElement}

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor,
          },

          headerTintColor:
            textColor,

          headerTitleStyle: {
            color: textColor,
            fontSize: 18,
            fontWeight: "700",
          },

          headerShadowVisible: false,

          headerBackButtonDisplayMode:
            "default",

          contentStyle: {
            backgroundColor,
          },

          animation: "default",
        }}
      >
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tab)"
          options={{
            title: "CareLink",
            headerShown: true,

            headerRight: () => (
              <ThemeSwitcher
                theme={theme}
                colorScheme={colorScheme}
                setTheme={setTheme}
              />
            ),
          }}
        />

        <Stack.Screen
          name="providers/[id]"
          options={{
            title: "",
          }}
        />

        <Stack.Protected
          guard={isAuthenticated}
        >
          <Stack.Screen
            name="edit-profile"
            options={{
              title: "",
            }}
          />

          <Stack.Screen
            name="change-password"
            options={{
              title: "",
            }}
          />

          <Stack.Screen
            name="booking/[providerId]"
            options={{
              title: "",
            }}
          />

          <Stack.Screen
            name="booking/confirmation"
            options={{
              title: "",
            }}
          />

          <Stack.Screen
            name="appointments/[id]"
            options={{
              title: "",
            }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );
}

interface ThemeSwitcherProps {
  theme: ThemeMode;
  colorScheme: "light" | "dark";
  setTheme: (
    theme: ThemeMode,
  ) => Promise<void>;
}

function ThemeSwitcher({
  theme,
  colorScheme,
  setTheme,
}: ThemeSwitcherProps) {
  function handleThemeChange(
    nextTheme: ThemeMode,
  ): void {
    void setTheme(nextTheme);
  }

  return (
   <View
    style={[
      styles.themeContainer,
      colorScheme === "dark" &&
        styles.themeContainerDark,
    ]}
  >
      <ThemeIconButton
        label="Light theme"
        icon="sunny-outline"
        selected={theme === "light"}
        colorScheme={colorScheme}
        onPress={() =>
          handleThemeChange("light")
        }
      />

      <ThemeIconButton
        label="Dark theme"
        icon="moon-outline"
        selected={theme === "dark"}
        colorScheme={colorScheme}
        onPress={() =>
          handleThemeChange("dark")
        }
      />

      <ThemeIconButton
        label="Use system theme"
        icon="phone-portrait-outline"
        selected={theme === "system"}
        colorScheme={colorScheme}
        onPress={() =>
          handleThemeChange("system")
        }
      />
    </View>
  );
}

interface ThemeIconButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  colorScheme: "light" | "dark";
  onPress: () => void;
}

function ThemeIconButton({
  label,
  icon,
  selected,
  colorScheme,
  onPress,
}: ThemeIconButtonProps) {
  return (
    <Pressable
      onPressIn={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.themeButton,
        selected &&
          (colorScheme === "dark"
            ? styles.themeButtonSelectedDark
            : styles.themeButtonSelected),
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          selected
            ? colorScheme === "dark"
              ? "#60A5FA"
              : "#2563EB"
            : colorScheme === "dark"
              ? "#9CA3AF"
              : "#6B7280"
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  themeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    padding: 4,
    marginRight: 8,
  },

  themeContainerDark: {
    borderColor: "#374151",
    backgroundColor: "#111827",
  },

  themeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  themeButtonSelected: {
    backgroundColor: "#FFFFFF",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,

    elevation: 2,
  },

  themeButtonSelectedDark: {
    backgroundColor: "#374151",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,

    elevation: 2,
  },
});