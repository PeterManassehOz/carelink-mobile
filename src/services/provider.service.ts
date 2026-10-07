import { apiRequest } from "./api";

export interface Provider {
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
  createdAt: string;
  updatedAt: string;
}

interface ProvidersResponse {
  success: boolean;
  data: {
    providers: Provider[];
  };
}

interface ProviderResponse {
  success: boolean;
  data: {
    provider: Provider;
  };
}

export interface ProviderFilters {
  search?: string;
  specialty?: string;
  location?: string;
}

export async function getProviders(
  filters?: ProviderFilters,
): Promise<Provider[]> {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.append("search", filters.search);
  }

  if (filters?.specialty) {
    params.append("specialty", filters.specialty);
  }

  if (filters?.location) {
    params.append("location", filters.location);
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/providers?${queryString}`
    : "/providers";

  const response =
    await apiRequest<ProvidersResponse>(endpoint);

  return response.data.providers;
}

export async function getProviderById(
  providerId: string,
): Promise<Provider> {
  const response =
    await apiRequest<ProviderResponse>(
      `/providers/${providerId}`,
    );

  return response.data.provider;
}