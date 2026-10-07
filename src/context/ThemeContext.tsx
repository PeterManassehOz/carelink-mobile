import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  useColorScheme,
} from "nativewind";

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  colorScheme: "light" | "dark";
  isLoading: boolean;
  setTheme: (
    theme: ThemeMode,
  ) => Promise<void>;
}

const THEME_STORAGE_KEY =
  "@carelink_theme";

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const {
    colorScheme,
    setColorScheme,
  } = useColorScheme();

  const [theme, setThemeState] =
    useState<ThemeMode>("system");

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function initializeTheme(): Promise<void> {
      try {
        const storedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY,
          );

        const initialTheme: ThemeMode =
          storedTheme === "light" ||
          storedTheme === "dark" ||
          storedTheme === "system"
            ? storedTheme
            : "system";

        setThemeState(initialTheme);

        setColorScheme(initialTheme);
      } catch (error) {
        console.error(
          "Failed to load theme preference:",
          error,
        );

        setThemeState("system");
        setColorScheme("system");
      } finally {
        setIsLoading(false);
      }
    }

    initializeTheme();
  }, [setColorScheme]);

  async function setTheme(
    nextTheme: ThemeMode,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        nextTheme,
      );

      setThemeState(nextTheme);
      setColorScheme(nextTheme);
    } catch (error) {
      console.error(
        "Failed to save theme preference:",
        error,
      );

      throw error;
    }
  }

  if (isLoading) {
    return null;
  }

  const resolvedColorScheme =
    colorScheme === "dark"
      ? "dark"
      : "light";

  const value: ThemeContextValue = {
    theme,
    colorScheme:
      resolvedColorScheme,
    isLoading: false,
    setTheme,
  };

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}