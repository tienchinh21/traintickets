import type { ApiSuccess } from '@/shared/api/types'
import { http } from '@/shared/api/http'
import type { Station, StationFormValues, UpdateStationPayload } from '../types/operations.types'

export const operationsApi = {
  async getStations() {
    const response = await http.get<ApiSuccess<Station[]>>('/stations')
    return response.data
  },

  async createStation(payload: StationFormValues) {
    const response = await http.post<ApiSuccess<Station>>('/stations', payload)
    return response.data
  },

  async updateStation(id: string, payload: UpdateStationPayload) {
    const response = await http.patch<ApiSuccess<Station>>(`/stations/${id}`, payload)
    return response.data
  },

  async deleteStation(id: string) {
    const response = await http.delete<ApiSuccess<Station>>(`/stations/${id}`)
    return response.data
  },
}
