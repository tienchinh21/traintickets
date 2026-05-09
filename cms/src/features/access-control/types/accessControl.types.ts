import type { components } from '@/lib/api/schema'

export type AccessStatus = 'ACTIVE' | 'INACTIVE'

export type Permission = Record<string, unknown> & {
  id: string
  code: string
  name: string
  description: string | null
  module: string
  action: string
  method: string | null
  path: string | null
  status: AccessStatus
  createdAt: string
  updatedAt: string
}

export type Role = Record<string, unknown> & {
  id: string
  code: string
  name: string
  description: string | null
  status: AccessStatus
  createdAt: string
  updatedAt: string
}

export type RolePermission = {
  id: string
  roleId: string
  permissionId: string
  createdAt: string
  permission: Permission
}

export type RoleDetail = Role & {
  permissions: RolePermission[]
}

export type RoleFormValues = components['schemas']['CreateRoleDto']
export type UpdateRolePayload = components['schemas']['UpdateRoleDto']
export type SyncRolePermissionsPayload = components['schemas']['SyncRolePermissionsDto']

export type PermissionFormValues = components['schemas']['CreatePermissionDto']
export type UpdatePermissionPayload = components['schemas']['UpdatePermissionDto']
