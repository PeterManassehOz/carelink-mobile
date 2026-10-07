import { apiRequest } from "./api";

export type AppointmentStatus =
  | "booked"
  | "cancelled";

export interface AppointmentProvider {
  id: string;
  name: string;
  specialty: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  image?: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface Appointment {
  id: string;
  provider: AppointmentProvider;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentsResponse {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
}

interface AppointmentResponse {
  success: boolean;
  data: {
    appointment: Appointment;
  };
}

export interface CreateAppointmentInput {
  providerId: string;
  date: string;
  time: string;
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const response =
    await apiRequest<AppointmentResponse>(
      "/appointments",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );

  return response.data.appointment;
}

export async function getAppointments(): Promise<
  Appointment[]
> {
  const response =
    await apiRequest<AppointmentsResponse>(
      "/appointments",
    );

  return response.data.appointments;
}

export async function getAppointmentById(
  appointmentId: string,
): Promise<Appointment> {
  const response =
    await apiRequest<AppointmentResponse>(
      `/appointments/${appointmentId}`,
    );

  return response.data.appointment;
}

export async function cancelAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response =
    await apiRequest<AppointmentResponse>(
      `/appointments/${appointmentId}/cancel`,
      {
        method: "PATCH",
      },
    );

  return response.data.appointment;
}