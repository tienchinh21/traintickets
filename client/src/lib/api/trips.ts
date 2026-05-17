import { apiClient } from "@/lib/api/client";
import type { ClientTripSearchItem, SearchCriteria } from "@/types/train";

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

export async function searchClientTrips(criteria: SearchCriteria) {
  const response = await apiClient.post<ApiListResponse<ClientTripSearchItem>>(
    "/client/trips/search",
    criteria,
  );

  return response.data;
}
