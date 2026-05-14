import type { components } from '@/lib/api/schema'

export type EntityStatus = 'ACTIVE' | 'INACTIVE'

export type Station = Record<string, unknown> & {
  id: string
  code: string
  name: string
  slug: string
  city: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  timezone: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type StationFormValues = components['schemas']['CreateStationDto']
export type UpdateStationPayload = components['schemas']['UpdateStationDto']

export type RouteStopFormValues = components['schemas']['RouteStopDto']

export type Route = Record<string, unknown> & {
  id: string
  code: string
  name: string
  description: string | null
  status: EntityStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type RouteStop = Record<string, unknown> & {
  id: string
  routeId: string
  stationId: string
  stopOrder: number
  distanceFromStartKm: string | number
  defaultArrivalOffsetMinutes: number | null
  defaultDepartureOffsetMinutes: number | null
  station: Station
}

export type RouteDetail = Route & {
  stops: RouteStop[]
}

export type RouteFormValues = components['schemas']['CreateRouteDto']
export type UpdateRoutePayload = components['schemas']['UpdateRouteDto']

export type TrainStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'

export type Train = Record<string, unknown> & {
  id: string
  code: string
  name: string
  description: string | null
  status: TrainStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type TrainFormValues = components['schemas']['CreateTrainDto']
export type UpdateTrainPayload = components['schemas']['UpdateTrainDto']

export type CarriageStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
export type CarriageType = 'SEAT' | 'SLEEPER' | 'VIP'

export type Carriage = Record<string, unknown> & {
  id: string
  trainId: string
  carriageNumber: number
  name: string
  carriageType: CarriageType
  seatMapLayout: Record<string, unknown> | null
  status: CarriageStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CarriageFormValues = components['schemas']['CreateCarriageDto']
export type UpdateCarriagePayload = components['schemas']['UpdateCarriageDto']

export type SeatType = Record<string, unknown> & {
  id: string
  code: string
  name: string
  description: string | null
  baseMultiplier: string | number
  allowedCarriageTypes: CarriageType[]
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export type SeatTypeFormValues = components['schemas']['CreateSeatTypeDto']
export type UpdateSeatTypePayload = components['schemas']['UpdateSeatTypeDto']

export type SeatStatus = 'ACTIVE' | 'BROKEN' | 'INACTIVE'

export type Seat = Record<string, unknown> & {
  id: string
  carriageId: string
  seatTypeId: string
  seatNumber: string
  rowNumber: number | null
  columnNumber: number | null
  floorNumber: number | null
  status: SeatStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  seatType: SeatType
}

export type SeatFormValues = components['schemas']['CreateSeatDto']
export type UpdateSeatPayload = components['schemas']['UpdateSeatDto']

export type TripStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED'

export type TripRouteSummary = Pick<Route, 'id' | 'code' | 'name' | 'status'>
export type TripTrainSummary = Pick<Train, 'id' | 'code' | 'name' | 'status'>

export type Trip = Record<string, unknown> & {
  id: string
  routeId: string
  trainId: string
  code: string
  serviceDate: string
  status: TripStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  route: TripRouteSummary
  train: TripTrainSummary
}

export type TripStop = Record<string, unknown> & {
  id: string
  tripId: string
  stationId: string
  stopOrder: number
  scheduledArrivalAt: string | null
  scheduledDepartureAt: string | null
  distanceFromStartKm: string | number
  station: Station
}

export type TripDetail = Trip & {
  stops: TripStop[]
}

export type TripFormValues = {
  routeId: string
  trainId: string
  code: string
  serviceDate: string
  status: TripStatus
}

export type UpdateTripPayload = Partial<TripFormValues>

export type TripQuery = {
  page?: number
  limit?: number
  search?: string
  status?: TripStatus
  routeId?: string
  trainId?: string
  serviceDate?: string
}

export type TripSearchPayload = {
  fromStationId: string
  toStationId: string
  serviceDate: string
  status?: TripStatus
  page?: number
  limit?: number
}

export type TripListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}
