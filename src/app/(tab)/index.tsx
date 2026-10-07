import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import ProviderCard from "@/components/ProviderCard";
import SearchBar from "@/components/SearchBar";
import ScreenLoader from "@/components/ScreenLoader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

import {
  ApiError,
  NetworkError,
} from "@/services/api";

import {
  getProviders,
  type Provider,
} from "@/services/provider.service";

const BASE_BOTTOM_PADDING = 24;

export default function HomeScreen() {
  const flatListRef =
    useRef<FlatList<Provider>>(null);

  const scrollOffsetRef =
    useRef(0);

  const keyboardHeightRef =
    useRef(0);

  const [keyboardHeight, setKeyboardHeight] =
    useState(0);

  const [providers, setProviders] =
    useState<Provider[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [retryKey, setRetryKey] =
    useState(0);

  useEffect(() => {
    const timeoutId =
      setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);

          const data =
            await getProviders({
              search:
                search.trim() ||
                undefined,
            });

          setProviders(data);
        } catch (error) {
          if (error instanceof NetworkError) {
            setError(
              "Unable to connect to the server. Please check your internet connection and try again.",
            );
          } else if (
            error instanceof ApiError
          ) {
            setError(
              "Unable to load healthcare providers right now. Please try again.",
            );
          } else {
            setError(
              "Something went wrong while loading healthcare providers. Please try again.",
            );
          }
        } finally {
          setLoading(false);
        }
      }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, retryKey]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios"
        ? "keyboardWillShow"
        : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide";

    const showSub =
      Keyboard.addListener(
        showEvent,
        (e) => {
          const height =
            e.endCoordinates.height;

          keyboardHeightRef.current =
            height;

          setKeyboardHeight(height);

          requestAnimationFrame(() => {
            flatListRef.current?.scrollToOffset(
              {
                offset:
                  scrollOffsetRef.current +
                  height,
                animated: true,
              },
            );
          });
        },
      );

    const hideSub =
      Keyboard.addListener(
        hideEvent,
        () => {
          const height =
            keyboardHeightRef.current;

          keyboardHeightRef.current = 0;

          flatListRef.current?.scrollToOffset(
            {
              offset: Math.max(
                0,
                scrollOffsetRef.current -
                  height,
              ),
              animated: true,
            },
          );

          setKeyboardHeight(0);
        },
      );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function handleRetry(): void {
    setRetryKey(
      (current) => current + 1,
    );
  }

  const hasSearch =
    search.trim().length > 0;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-950"
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <FlatList
        ref={flatListRef}
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProviderCard provider={item} />
        )}
        contentContainerClassName="px-6"
        contentContainerStyle={{
          paddingBottom:
            keyboardHeight > 0
              ? keyboardHeight +
                BASE_BOTTOM_PADDING
              : BASE_BOTTOM_PADDING,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollOffsetRef.current =
            e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View className="pb-6 pt-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  Find the right care
                </Text>

                <Text className="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">
                  Discover healthcare
                  providers and find
                  care that fits your
                  needs.
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50">
                <Ionicons name="heart-outline" size={22} color="#1D4ED8" />
              </View>
            </View>

            <View className="mt-6">
              <SearchBar
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View className="mt-7 flex-row items-center gap-2">
              <Ionicons name="medkit-outline" size={17} color="#111827" />
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Healthcare providers
              </Text>
            </View>

            {loading && (
              <ScreenLoader
                message="Loading providers..."
              />
            )}

            {error && !loading && (
              <ErrorState
                message={error}
                onRetry={handleRetry}
              />
            )}

            {!loading &&
              !error &&
              providers.length === 0 && (
                <EmptyState
                  icon={hasSearch ? "search-outline" : "medkit-outline"}
                  title={
                    hasSearch
                      ? "No providers found"
                      : "No providers available"
                  }
                  message={
                    hasSearch
                      ? "No healthcare providers match your search. Try a different search term."
                      : "No healthcare providers are available right now."
                  }
                />
              )}
          </View>
        }
        ListEmptyComponent={null}
      />
    </KeyboardAvoidingView>
  );
}