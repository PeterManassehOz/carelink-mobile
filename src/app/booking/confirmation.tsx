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
  getAppointmentById,
  type Appointment,
} from "@/services/appointment.service";

import AppButton from "@/components/AppButton";
import ErrorState from "@/components/ErrorState";
import ScreenLoader from "@/components/ScreenLoader";

function formatAppointmentDate(
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

export default function BookingConfirmationScreen() {
  const router = useRouter();

  const {
    appointmentId,
  } = useLocalSearchParams<{
    appointmentId: string;
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
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadAppointment() {
      if (!appointmentId) {
        setError(
          "Appointment ID is missing",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await getAppointmentById(
            appointmentId,
          );

        setAppointment(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load appointment",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [appointmentId]);

  function handleViewAppointments() {
    router.replace("/appointments");
  }

  function handleBackHome() {
    router.replace("/");
  }

  if (loading) {
    return (
      <ScreenLoader message="Loading confirmation..." />
    );
  }


  if (error || !appointment) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <ErrorState
          message={
            error ?? "Appointment not found"
          }
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
      contentContainerClassName="flex-grow px-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 items-center pt-16">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
          <Ionicons name="checkmark" size={40} color="#16A34A" />
        </View>

        <Text className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Appointment booked
        </Text>

        <Text className="mt-3 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
          Your appointment has been
          successfully confirmed.
        </Text>

        <View className="mt-8 w-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <View className="flex-row items-center gap-2">
            <Ionicons name="medkit-outline" size={13} color="#6B7280" />
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              PROVIDER
            </Text>
          </View>

          <Text className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {appointment.provider.name}
          </Text>

          <Text className="mt-1 text-base font-medium text-blue-700 dark:text-blue-400">
            {appointment.provider.specialty}
          </Text>

          <ConfirmationRow icon="calendar-outline" label="DATE" value={formatAppointmentDate(appointment.date)} />
          <ConfirmationRow icon="time-outline" label="TIME" value={appointment.time} />
          <ConfirmationRow icon="location-outline" label="LOCATION" value={appointment.provider.location} />

          <View className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle-outline" size={13} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                STATUS
              </Text>
            </View>

            <Text className="mt-1 text-base font-semibold capitalize text-green-700 dark:text-green-400">
              {appointment.status}
            </Text>
          </View>
        </View>

        <View className="mt-auto w-full pt-8">
          <AppButton
            title="View My Appointments"
            icon="calendar-outline"
            onPress={handleViewAppointments}
          />

          <AppButton
            title="Back to Home"
            icon="home-outline"
            variant="secondary"
            onPress={handleBackHome}
            className="mt-3"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ConfirmationRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={13} color="#6B7280" />
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