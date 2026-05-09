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
