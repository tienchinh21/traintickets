import { apiClient } from "@/lib/api/client";
import type { ClientStationOption } from "@/types/train";

type ApiListResponse<T> = {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
};

export type StationQuery = {
  search?: string;
  province?: string;
  city?: string;
  page?: number;
  limit?: number;
};

export async function getClientStations(query: StationQuery = {}) {
  const response = await apiClient.get<ApiListResponse<ClientStationOption>>(
    "/client/stations",
    {
      params: query,
    },
  );

  return response.data;
}
