import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  ApiError,
  NetworkError,
} from "@/services/api";

import {
  getProviderById,
  type Provider,
} from "@/services/provider.service";
import AppButton from "@/components/AppButton";
import ErrorState from "@/components/ErrorState";
import ScreenLoader from "@/components/ScreenLoader";



export default function ProviderDetailsScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    provider,
    setProvider,
  ] = useState<Provider | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  useEffect(() => {
    async function loadProvider() {
      if (!id) {
        setError(
          "Provider information is unavailable.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getProviderById(id);

        setProvider(data);
      } catch (error) {
        if (
          error instanceof NetworkError
        ) {
          setError(
            "Unable to connect to the server. Please check your internet connection and try again.",
          );
        } else if (
          error instanceof ApiError &&
          error.status === 404
        ) {
          setError(
            "This healthcare provider could not be found.",
          );
        } else if (
          error instanceof ApiError
        ) {
          setError(
            "Unable to load this healthcare provider right now. Please try again.",
          );
        } else {
          setError(
            "Something went wrong while loading this healthcare provider. Please try again.",
          );
        }

        setProvider(null);
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [id, retryKey]);

  function handleRetry(): void {
    setRetryKey(
      (current) => current + 1,
    );
  }

  if (loading) {
    return (
      <ScreenLoader message="Loading provider..." />
    );
  }

  if (error || !provider) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <ErrorState
          message={
            error ??
            "This healthcare provider could not be found."
          }
          onRetry={error ? handleRetry : undefined}
        />

        <View className="px-6 pb-10">
          <AppButton
            title="Go back"
            icon="arrow-back-outline"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-950"
      contentContainerClassName="px-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="pt-8">
        <View className="flex-row items-start gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50">
            <Ionicons name="medkit-outline" size={28} color="#1D4ED8" />
          </View>

          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {provider.name}
            </Text>

            <Text className="mt-1 text-base font-semibold text-blue-700 dark:text-blue-400">
              {provider.specialty}
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <View className="flex-row items-center gap-2">
            <Ionicons name="information-circle-outline" size={17} color="#111827" />
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              About
            </Text>
          </View>

          <Text className="mt-2 text-base leading-6 text-gray-600 dark:text-gray-300">
            {provider.description}
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={17} color="#111827" />
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Location
            </Text>
          </View>

          <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
            {provider.location}
          </Text>
        </View>

        {provider.phone && (
          <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2">
              <Ionicons name="call-outline" size={17} color="#111827" />
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                Phone
              </Text>
            </View>

            <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
              {provider.phone}
            </Text>
          </View>
        )}

        {provider.email && (
          <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2">
              <Ionicons name="mail-outline" size={17} color="#111827" />
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                Email
              </Text>
            </View>

            <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
              {provider.email}
            </Text>
          </View>
        )}

        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={17} color="#111827" />
            <Text className="text-base font-bold text-gray-900 dark:text-white">
              Availability
            </Text>
          </View>

          {provider.availability.map(
            (slot) => (
              <View
                key={`${slot.day}-${slot.startTime}-${slot.endTime}`}
                className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800"
              >
                <Text className="text-base text-gray-700 dark:text-gray-300">
                  {slot.day}
                </Text>

                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {slot.startTime} -{" "}
                  {slot.endTime}
                </Text>
              </View>
            ),
          )}
        </View>

        <AppButton
          title="Book Appointment"
          icon="calendar-outline"
          onPress={() =>
            router.push(
              `/booking/${provider.id}`,
            )
          }
          className="mt-8"
        />
      </View>
    </ScrollView>
  );
}