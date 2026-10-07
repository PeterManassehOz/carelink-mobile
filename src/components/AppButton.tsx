import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface AppButtonProps
  extends Omit<PressableProps, "children"> {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
}

export default function AppButton({
  title,
  loading = false,
  variant = "primary",
  icon,
  iconPosition = "left",
  disabled = false,
  className = "",
  ...props
}: AppButtonProps) {
  const isDisabled =
    disabled || loading;

  const baseClasses =
    "min-h-14 flex-row items-center justify-center rounded-2xl px-5 gap-2";

  const variantClasses =
    variant === "primary"
      ? isDisabled
        ? "bg-gray-300 dark:bg-gray-700"
        : "bg-blue-700 dark:bg-blue-600"
      : variant === "danger"
        ? isDisabled
          ? "bg-gray-300 dark:bg-gray-700"
          : "bg-red-600 dark:bg-red-700"
        : isDisabled
          ? "border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
          : "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900";

  const textClasses =
    variant === "secondary"
      ? "text-base font-bold text-gray-800 dark:text-gray-200"
      : "text-base font-bold text-white";

  const iconColor =
    variant === "secondary"
      ? isDisabled
        ? "#9CA3AF"
        : "#374151"
      : "#FFFFFF";

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${!isDisabled ? "active:opacity-80" : ""}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary"
              ? undefined
              : "#FFFFFF"
          }
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons name={icon} size={18} color={iconColor} />
          )}

          <Text className={textClasses}>
            {title}
          </Text>

          {icon && iconPosition === "right" && (
            <Ionicons name={icon} size={18} color={iconColor} />
          )}
        </>
      )}
    </Pressable>
  );
}