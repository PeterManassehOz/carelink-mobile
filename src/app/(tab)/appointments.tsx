import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  ApiError,
  NetworkError,
} from "@/services/api";

import {
  getAppointments,
  type Appointment,
} from "@/services/appointment.service";

import AppButton from "@/components/AppButton";
import EmptyState from "@/components/EmptyState";

function formatDate(
  date: string,
): string {
  const parsedDate = new Date(
    `${date}T00:00:00`,
  );

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function isUpcoming(
  appointment: Appointment,
): boolean {
  if (
    appointment.status ===
    "cancelled"
  ) {
    return false;
  }

  const appointmentDateTime =
    new Date(
      `${appointment.date}T${appointment.time}:00`,
    );

  return (
    appointmentDateTime.getTime() >=
    Date.now()
  );
}

function AppointmentCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  const router = useRouter();

  const cancelled =
    appointment.status ===
    "cancelled";

  const upcoming =
    isUpcoming(appointment);

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/appointments/${appointment.id}`,
        )
      }
      className="
        mb-4
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        active:opacity-70
        dark:border-gray-800
        dark:bg-gray-900
      "
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 flex-row items-start gap-3 pr-4">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
            <Ionicons name="medkit-outline" size={20} color="#1D4ED8" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {appointment.provider.name}
            </Text>

            <Text className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-400">
              {appointment.provider.specialty}
            </Text>
          </View>
        </View>

        <View
          className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${
            cancelled
              ? "bg-gray-100 dark:bg-gray-800"
              : upcoming
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-blue-100 dark:bg-blue-900/40"
          }`}
        >
          <Ionicons
            name={
              cancelled
                ? "close-circle"
                : upcoming
                  ? "time-outline"
                  : "checkmark-circle"
            }
            size={12}
            color={
              cancelled
                ? "#6B7280"
                : upcoming
                  ? "#16A34A"
                  : "#1D4ED8"
            }
          />
          <Text
            className={`text-xs font-semibold ${
              cancelled
                ? "text-gray-600 dark:text-gray-300"
                : upcoming
                  ? "text-green-700 dark:text-green-400"
                  : "text-blue-700 dark:text-blue-400"
            }`}
          >
            {cancelled
              ? "Cancelled"
              : upcoming
                ? "Upcoming"
                : "Completed"}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
        <View className="flex-1 flex-row items-center gap-2.5">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Date
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(appointment.date)}
            </Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center gap-2.5">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <View>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Time
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
              {appointment.time}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-blue-700 dark:text-blue-400">
          View appointment
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#1D4ED8" />
      </View>
    </Pressable>
  );
}

export default function AppointmentsScreen() {
  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadAppointments =
    useCallback(
      async (
        options?: {
          refreshing?: boolean;
        },
      ) => {
        const isRefreshing =
          options?.refreshing === true;

        try {
          if (isRefreshing) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError(null);

          const data =
            await getAppointments();

          setAppointments(data);
        } catch (error) {
          if (
            error instanceof NetworkError
          ) {
            setError(
              "Unable to connect to the server. Please check your internet connection and try again.",
            );
          } else if (
            error instanceof ApiError &&
            error.status === 401
          ) {
            setError(
              "Your session has expired. Please log in again.",
            );
          } else if (
            error instanceof ApiError
          ) {
            setError(
              "Unable to load your appointments right now. Please try again.",
            );
          } else {
            setError(
              "Something went wrong while loading your appointments. Please try again.",
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments]),
  );

  const handleRefresh =
    useCallback(() => {
      loadAppointments({
        refreshing: true,
      });
    }, [loadAppointments]);

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        isUpcoming(appointment),
    );

  const otherAppointments =
    appointments.filter(
      (appointment) =>
        !isUpcoming(appointment),
    );

  const hasAppointments =
    appointments.length > 0;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <FlatList
        data={[
          ...upcomingAppointments,
          ...otherAppointments,
        ]}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
          />
        )}
        contentContainerClassName="px-6 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1D4ED8"
          />
        }
        ListHeaderComponent={
          <View className="pb-6 pt-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              My appointments
            </Text>

            <Text className="mt-2 text-base leading-6 text-gray-500 dark:text-gray-400">
              Keep track of your
              upcoming and past
              appointments.
            </Text>

            {error &&
              hasAppointments && (
                <View className="mt-5 flex-row items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color="#DC2626"
                    style={{ marginTop: 1 }}
                  />
                  <View className="flex-1">
                    <Text className="text-sm leading-5 text-red-700 dark:text-red-400">
                      {error}
                    </Text>

                    <AppButton
                      title="Try again"
                      icon="refresh-outline"
                      onPress={() =>
                        loadAppointments()
                      }
                      className="mt-4 self-start min-h-0 px-5 py-3"
                    />
                  </View>
                </View>
              )}

            {appointments.length >
              0 && (
              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={13} color="#2563EB" />
                    <Text className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Upcoming
                    </Text>
                  </View>

                  <Text className="mt-1 text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {
                      upcomingAppointments.length
                    }
                  </Text>
                </View>

                <View className="flex-1 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="albums-outline" size={13} color="#6B7280" />
                    <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Total
                    </Text>
                  </View>

                  <Text className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      appointments.length
                    }
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#2563EB" />

              <Text className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Loading appointments...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center py-12">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
                <Ionicons name="cloud-offline-outline" size={26} color="#DC2626" />
              </View>

              <Text className="px-6 text-center text-base text-red-600 dark:text-red-400">
                {error}
              </Text>

              <AppButton
                title="Try again"
                icon="refresh-outline"
                onPress={() =>
                  loadAppointments()
                }
                className="mt-5 min-h-0 px-6 py-3"
              />
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No appointments yet"
              message="Find a healthcare provider and book your first appointment."
            />
          )
        }
      />
    </View>
  );
}