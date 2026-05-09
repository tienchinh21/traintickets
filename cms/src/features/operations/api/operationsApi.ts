import type { ApiSuccess } from '@/shared/api/types'
import { http } from '@/shared/api/http'
import type {
  Route,
  RouteDetail,
  RouteFormValues,
  Station,
  StationFormValues,
  Train,
  TrainFormValues,
  UpdateRoutePayload,
  UpdateStationPayload,
  UpdateTrainPayload,
} from '../types/operations.types'

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

  async getRoutes() {
    const response = await http.get<ApiSuccess<Route[]>>('/routes')
    return response.data
  },

  async getRoute(id: string) {
    const response = await http.get<ApiSuccess<RouteDetail>>(`/routes/${id}`)
    return response.data
  },

  async createRoute(payload: RouteFormValues) {
    const response = await http.post<ApiSuccess<RouteDetail>>('/routes', payload)
    return response.data
  },

  async updateRoute(id: string, payload: UpdateRoutePayload) {
    const response = await http.patch<ApiSuccess<RouteDetail>>(`/routes/${id}`, payload)
    return response.data
  },

  async deleteRoute(id: string) {
    const response = await http.delete<ApiSuccess<Route>>(`/routes/${id}`)
    return response.data
  },

  async getTrains() {
    const response = await http.get<ApiSuccess<Train[]>>('/trains')
    return response.data
  },

  async createTrain(payload: TrainFormValues) {
    const response = await http.post<ApiSuccess<Train>>('/trains', payload)
    return response.data
  },

  async updateTrain(id: string, payload: UpdateTrainPayload) {
    const response = await http.patch<ApiSuccess<Train>>(`/trains/${id}`, payload)
    return response.data
  },

  async deleteTrain(id: string) {
    const response = await http.delete<ApiSuccess<Train>>(`/trains/${id}`)
    return response.data
  },
}
