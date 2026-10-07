import {
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search providers...",
}: SearchBarProps) {
  return (
    <View
      className="
        flex-row
        items-center
        rounded-2xl
        border
        border-gray-200
        bg-gray-50
        px-4
        dark:border-gray-800
        dark:bg-gray-900
      "
    >
      <Ionicons name="search-outline" size={18} color="#9CA3AF" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        className="
          ml-2.5
          h-12
          flex-1
          text-base
          text-gray-900
          dark:text-white
        "
        selectionColor="#2563EB"
      />
    </View>
  );
}