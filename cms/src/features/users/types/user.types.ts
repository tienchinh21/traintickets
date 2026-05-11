import type { components } from '@/lib/api/schema'

export type UserType = 'CUSTOMER' | 'STAFF' | 'SYSTEM'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED'

export type UserRoleSummary = {
  id: string
  code: string
  name: string
  status: 'ACTIVE' | 'INACTIVE'
}

export type User = Record<string, unknown> & {
  id: string
  email: string | null
  phone: string | null
  fullName: string
  userType: UserType
  status: UserStatus
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  roles: UserRoleSummary[]
}

export type UserFormValues = components['schemas']['CreateUserDto']
export type UpdateUserPayload = components['schemas']['UpdateUserDto']

export type UserListQuery = {
  page?: number
  limit?: number
  search?: string
  userType?: UserType
  status?: UserStatus
}

export type UserListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}
