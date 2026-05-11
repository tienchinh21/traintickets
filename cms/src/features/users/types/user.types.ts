import type { Role } from '@/features/access-control/types/accessControl.types'
import type { components } from '@/lib/api/schema'

export type UserType = 'CUSTOMER' | 'STAFF' | 'SYSTEM'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED'

export type UserRole = {
  id: string
  userId: string
  roleId: string
  createdAt: string
  role: Role
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
  roles: UserRole[]
}

export type UserFormValues = components['schemas']['CreateUserDto']
export type UpdateUserPayload = components['schemas']['UpdateUserDto']
