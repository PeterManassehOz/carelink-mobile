import {
  useEffect,
  useState,
} from "react";
import {
  Alert,
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
  cancelAppointment,
  getAppointmentById,
  type Appointment,
} from "@/services/appointment.service";
import AppButton from "@/components/AppButton";
import ErrorState from "@/components/ErrorState";
import ScreenLoader from "@/components/ScreenLoader";

function formatDate(
  date: string,
): string {
  const parsedDate = new Date(
    `${date}T00:00:00`,
  );

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

export default function AppointmentDetailsScreen() {
  const router = useRouter();

  const {
    id,
  } = useLocalSearchParams<{
    id: string;
  }>();

  const [
    appointment,
    setAppointment,
  ] = useState<Appointment | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    retryKey,
    setRetryKey,
  ] = useState(0);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadAppointment() {
      if (!id) {
        setError(
          "Appointment information is unavailable.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getAppointmentById(
            id,
          );

        setAppointment(data);
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
          error instanceof ApiError &&
          error.status === 404
        ) {
          setError(
            "This appointment could not be found.",
          );
        } else if (
          error instanceof ApiError
        ) {
          setError(
            "Unable to load this appointment right now. Please try again.",
          );
        } else {
          setError(
            "Something went wrong while loading this appointment. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [id, retryKey]);

  function handleRetry() {
    setRetryKey(
      (current) => current + 1,
    );
  }

  function requestCancellation() {
    if (
      !id ||
      !appointment ||
      appointment.status ===
        "cancelled" ||
      cancelling
    ) {
      return;
    }

    Alert.alert(
      "Cancel appointment",
      `Are you sure you want to cancel your appointment with ${appointment.provider.name}?`,
      [
        {
          text: "Keep appointment",
          style: "cancel",
        },
        {
          text: "Cancel appointment",
          style: "destructive",
          onPress: handleCancel,
        },
      ],
    );
  }

  async function handleCancel() {
    if (
      !id ||
      !appointment ||
      appointment.status ===
        "cancelled" ||
      cancelling
    ) {
      return;
    }

    try {
      setCancelling(true);
      setActionError(null);

      const updated =
        await cancelAppointment(id);

      setAppointment(updated);
    } catch (error) {
      if (
        error instanceof NetworkError
      ) {
        setActionError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setActionError(
          "Your session has expired. Please log in again.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        setActionError(
          "This appointment could not be found.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 409
      ) {
        setActionError(
          "This appointment has already been cancelled.",
        );

        setAppointment(
          (current) =>
            current
              ? {
                  ...current,
                  status:
                    "cancelled",
                }
              : current,
        );
      } else if (
        error instanceof ApiError
      ) {
        setActionError(
          "Unable to cancel this appointment right now. Please try again.",
        );
      } else {
        setActionError(
          "Something went wrong while cancelling this appointment. Please try again.",
        );
      }
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <ScreenLoader message="Loading appointment..." />
    );
  }

  if (error || !appointment) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <ErrorState
          message={
            error ??
            "This appointment could not be found."
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

  const cancelled =
    appointment.status ===
    "cancelled";

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-950"
      contentContainerClassName="px-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="pt-6">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={14} color="#1D4ED8" />
          <Text className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Appointment
          </Text>
        </View>

        <Text className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {appointment.provider.name}
        </Text>

        <Text className="mt-1 text-base font-medium text-blue-700 dark:text-blue-400">
          {appointment.provider.specialty}
        </Text>

        <View className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <DetailRow icon="calendar-outline" label="DATE" value={formatDate(appointment.date)} />
          <DetailRow icon="time-outline" label="TIME" value={appointment.time} divider />
          <DetailRow icon="location-outline" label="LOCATION" value={appointment.provider.location} divider />

          <View className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={cancelled ? "close-circle-outline" : "checkmark-circle-outline"}
                size={14}
                color={cancelled ? "#6B7280" : "#16A34A"}
              />
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                STATUS
              </Text>
            </View>

            <Text
              className={`mt-1 text-base font-semibold capitalize ${
                cancelled
                  ? "text-gray-600 dark:text-gray-300"
                  : "text-green-700 dark:text-green-400"
              }`}
            >
              {appointment.status}
            </Text>
          </View>
        </View>

        {actionError && (
          <View className="mt-5 flex-row items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
            <Ionicons
              name="alert-circle"
              size={18}
              color="#DC2626"
              style={{ marginTop: 1 }}
            />
            <Text className="flex-1 text-sm leading-5 text-red-700 dark:text-red-400">
              {actionError}
            </Text>
          </View>
        )}

        {!cancelled && (
          <AppButton
            title="Cancel Appointment"
            icon="close-circle-outline"
            variant="danger"
            loading={cancelling}
            disabled={cancelling}
            onPress={requestCancellation}
            className="mt-8"
          />
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  divider = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View className={divider ? "mt-5 border-t border-gray-100 pt-5 dark:border-gray-800" : ""}>
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={14} color="#6B7280" />
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </Text>
      </View>

      <Text className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
        {value}
      </Text>
    </View>
  );
}