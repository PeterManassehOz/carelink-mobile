import {
  forwardRef,
  useState,
  type ReactNode,
} from "react";

import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/context/ThemeContext";

interface AppInputProps extends TextInputProps {
  label: string;
  rightElement?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

const AppInput = forwardRef<
  TextInput,
  AppInputProps
>(function AppInput(
  {
    label,
    rightElement,
    icon,
    error,
    className = "",
    placeholderTextColor,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const { colorScheme } =
    useTheme();

  const isDark =
    colorScheme === "dark";

  const [isFocused, setIsFocused] =
    useState(false);

  const defaultPlaceholderColor =
    isDark
      ? "#6B7280"
      : "#9CA3AF";

  const iconColor = error
    ? isDark
      ? "#F87171"
      : "#DC2626"
    : isFocused
      ? isDark
        ? "#60A5FA"
        : "#1D4ED8"
      : isDark
        ? "#6B7280"
        : "#9CA3AF";

  const borderClasses = error
    ? "border-red-400 dark:border-red-500"
    : isFocused
      ? "border-blue-600 dark:border-blue-500"
      : "border-gray-200 dark:border-gray-800";

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </Text>

      <View
        className={`
          flex-row
          items-center
          rounded-2xl
          border
          bg-gray-50
          dark:bg-gray-900
          ${borderClasses}
        `}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={19}
            color={iconColor}
            style={{ marginLeft: 16 }}
          />
        )}

        <TextInput
          ref={ref}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={
            placeholderTextColor ??
            defaultPlaceholderColor
          }
          className={`
            h-14
            flex-1
            px-4
            text-base
            text-gray-900
            dark:text-white
            ${icon ? "pl-2.5" : ""}
            ${className}
          `}
        />

        {rightElement}
      </View>

      {error && (
        <View className="mt-1.5 flex-row items-center">
          <Ionicons
            name="alert-circle"
            size={13}
            color={isDark ? "#F87171" : "#DC2626"}
          />
          <Text className="ml-1 text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
});

export default AppInput;