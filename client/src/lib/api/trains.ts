import { apiClient } from "@/lib/api/client";
import type { SearchCriteria, TrainJourney } from "@/types/train";

export async function searchTrains(criteria: SearchCriteria) {
  const response = await apiClient.get<TrainJourney[]>("/trains", {
    params: criteria,
  });

  return response.data;
}
