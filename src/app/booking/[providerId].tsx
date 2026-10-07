import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
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

import {
  createAppointment,
} from "@/services/appointment.service";
import AppButton from "@/components/AppButton";
import ErrorState from "@/components/ErrorState";
import ScreenLoader from "@/components/ScreenLoader";


interface BookingDay {
  date: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
}

function formatDate(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNextAvailableDays(
  provider: Provider,
): BookingDay[] {
  const days: BookingDay[] = [];

  const today = new Date();

  for (let i = 0; i < 30; i += 1) {
    const date = new Date(today);

    date.setDate(
      today.getDate() + i,
    );

    const dayName =
      date.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        },
      );

    const isAvailable =
      provider.availability.some(
        (slot) =>
          slot.day === dayName,
      );

    if (isAvailable) {
      days.push({
        date: formatDate(date),
        dayName,
        dayNumber: date.getDate(),
        monthName:
          date.toLocaleDateString(
            "en-US",
            {
              month: "short",
            },
          ),
      });
    }

    if (days.length === 7) {
      break;
    }
  }

  return days;
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
): string[] {
  const slots: string[] = [];

  const [
    startHour,
    startMinute,
  ] = startTime
    .split(":")
    .map(Number);

  const [
    endHour,
    endMinute,
  ] = endTime
    .split(":")
    .map(Number);

  let currentMinutes =
    startHour * 60 +
    startMinute;

  const endMinutes =
    endHour * 60 +
    endMinute;

  while (
    currentMinutes < endMinutes
  ) {
    const hour = Math.floor(
      currentMinutes / 60,
    );

    const minute =
      currentMinutes % 60;

    slots.push(
      `${String(hour).padStart(
        2,
        "0",
      )}:${String(minute).padStart(
        2,
        "0",
      )}`,
    );

    currentMinutes += 30;
  }

  return slots;
}

export default function BookingScreen() {
  const router = useRouter();

  const {
    providerId,
  } = useLocalSearchParams<{
    providerId: string;
  }>();

  const [
    provider,
    setProvider,
  ] = useState<Provider | null>(
    null,
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string | null>(
    null,
  );

  const [
    selectedTime,
    setSelectedTime,
  ] = useState<string | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  );

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  useEffect(() => {
    async function loadProvider() {
      if (!providerId) {
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
          await getProviderById(
            providerId,
          );

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
            "Unable to load booking information right now. Please try again.",
          );
        } else {
          setError(
            "Something went wrong while loading booking information. Please try again.",
          );
        }

        setProvider(null);
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [providerId, retryKey]);

  const availableDays =
    useMemo(
      () =>
        provider
          ? getNextAvailableDays(
              provider,
            )
          : [],
      [provider],
    );

  const selectedAvailability =
    useMemo(() => {
      if (
        !provider ||
        !selectedDate
      ) {
        return null;
      }

      const date = new Date(
        `${selectedDate}T00:00:00`,
      );

      const dayName =
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "long",
          },
        );

      return (
        provider.availability.find(
          (slot) =>
            slot.day === dayName,
        ) ?? null
      );
    }, [
      provider,
      selectedDate,
    ]);

  const timeSlots =
    useMemo(() => {
      if (
        !selectedAvailability
      ) {
        return [];
      }

      return generateTimeSlots(
        selectedAvailability.startTime,
        selectedAvailability.endTime,
      );
    }, [
      selectedAvailability,
    ]);

  function handleRetry(): void {
    setRetryKey(
      (current) => current + 1,
    );
  }

  async function handleBooking() {
    if (
      !providerId ||
      !selectedDate ||
      !selectedTime ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const appointment =
        await createAppointment({
          providerId,
          date: selectedDate,
          time: selectedTime,
        });

      router.replace({
        pathname:
          "/booking/confirmation",
        params: {
          appointmentId:
            appointment.id,
        },
      });
    } catch (error) {
      if (
        error instanceof NetworkError
      ) {
        setSubmitError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 409
      ) {
        setSubmitError(
          "This time slot is no longer available. Please select another time.",
        );

        setSelectedTime(null);
      } else if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        setSubmitError(
          "This healthcare provider could not be found. Please go back and select another provider.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 400
      ) {
        setSubmitError(
          "The selected appointment time is no longer available. Please choose another time.",
        );

        setSelectedTime(null);
      } else if (
        error instanceof ApiError
      ) {
        setSubmitError(
          "Unable to book this appointment right now. Please try again.",
        );
      } else {
        setSubmitError(
          "Something went wrong while booking your appointment. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ScreenLoader message="Loading booking information..." />
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
    <View className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-6">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={14} color="#1D4ED8" />
            <Text className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              Book appointment
            </Text>
          </View>

          <Text className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {provider.name}
          </Text>

          <Text className="mt-1 text-base text-gray-500 dark:text-gray-400">
            {provider.specialty}
          </Text>

          <View className="mt-8 flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={17} color="#111827" />
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Select a date
            </Text>
          </View>

          {availableDays.length === 0 && (
            <View className="mt-4 items-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Ionicons name="calendar-clear-outline" size={24} color="#9CA3AF" />
              <Text className="mt-3 text-center text-base leading-6 text-gray-600 dark:text-gray-300">
                No available dates were
                found for this provider.
              </Text>
            </View>
          )}

          {availableDays.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
            >
              {availableDays.map((day) => {
                const selected =
                  selectedDate === day.date;

                return (
                  <Pressable
                    key={day.date}
                    onPress={() => {
                      setSelectedDate(day.date);
                      setSelectedTime(null);
                      setSubmitError(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    className={`mr-3 w-20 items-center rounded-2xl border p-3 active:opacity-80 ${
                      selected
                        ? "border-blue-700 bg-blue-700 dark:border-blue-600 dark:bg-blue-600"
                        : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selected
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {day.dayName.slice(0, 3)}
                    </Text>

                    <Text
                      className={`mt-1 text-2xl font-bold ${
                        selected
                          ? "text-white"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {day.dayNumber}
                    </Text>

                    <Text
                      className={`text-xs ${
                        selected
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {day.monthName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {selectedDate && (
            <>
              <View className="mt-8 flex-row items-center gap-2">
                <Ionicons name="time-outline" size={17} color="#111827" />
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Select a time
                </Text>
              </View>

              {timeSlots.length === 0 ? (
                <View className="mt-4 items-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <Ionicons name="time-outline" size={24} color="#9CA3AF" />
                  <Text className="mt-3 text-center text-base leading-6 text-gray-600 dark:text-gray-300">
                    No available time slots were
                    found for this date.
                  </Text>
                </View>
              ) : (
                <View className="mt-4 flex-row flex-wrap">
                  {timeSlots.map((time) => {
                    const selected =
                      selectedTime === time;

                    return (
                      <Pressable
                        key={time}
                        onPress={() => {
                          setSelectedTime(time);
                          setSubmitError(null);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{
                          selected,
                        }}
                        className={`mb-3 mr-3 rounded-xl border px-5 py-3 active:opacity-80 ${
                          selected
                            ? "border-blue-700 bg-blue-700 dark:border-blue-600 dark:bg-blue-600"
                            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                        }`}
                      >
                        <Text
                          className={`font-semibold ${
                            selected
                              ? "text-white"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {submitError && (
            <View className="mt-6 flex-row items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#DC2626"
                style={{ marginTop: 1 }}
              />
              <Text className="flex-1 text-sm leading-5 text-red-700 dark:text-red-400">
                {submitError}
              </Text>
            </View>
          )}

          <AppButton
            title="Confirm Appointment"
            icon="checkmark-circle-outline"
            loading={submitting}
            disabled={
              !selectedDate ||
              !selectedTime ||
              submitting
            }
            onPress={handleBooking}
            className="mt-8"
          />
        </View>
      </ScrollView>
    </View>
  );
}