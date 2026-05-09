import type { ApiSuccess } from '@/shared/api/types'
import { http } from '@/shared/api/http'
import type {
  Permission,
  PermissionFormValues,
  Role,
  RoleDetail,
  RoleFormValues,
  SyncRolePermissionsPayload,
  UpdatePermissionPayload,
  UpdateRolePayload,
} from '../types/accessControl.types'

export const accessControlApi = {
  async getRoles() {
    const response = await http.get<ApiSuccess<Role[]>>('/roles')
    return response.data
  },

  async getRole(id: string) {
    const response = await http.get<ApiSuccess<RoleDetail>>(`/roles/${id}`)
    return response.data
  },

  async createRole(payload: RoleFormValues) {
    const response = await http.post<ApiSuccess<Role>>('/roles', payload)
    return response.data
  },

  async updateRole(id: string, payload: UpdateRolePayload) {
    const response = await http.patch<ApiSuccess<Role>>(`/roles/${id}`, payload)
    return response.data
  },

  async deactivateRole(id: string) {
    const response = await http.delete<ApiSuccess<Role>>(`/roles/${id}`)
    return response.data
  },

  async syncRolePermissions(id: string, payload: SyncRolePermissionsPayload) {
    const response = await http.patch<ApiSuccess<RoleDetail>>(`/roles/${id}/permissions`, payload)
    return response.data
  },

  async getPermissions() {
    const response = await http.get<ApiSuccess<Permission[]>>('/permissions')
    return response.data
  },

  async createPermission(payload: PermissionFormValues) {
    const response = await http.post<ApiSuccess<Permission>>('/permissions', payload)
    return response.data
  },

  async updatePermission(id: string, payload: UpdatePermissionPayload) {
    const response = await http.patch<ApiSuccess<Permission>>(`/permissions/${id}`, payload)
    return response.data
  },

  async deactivatePermission(id: string) {
    const response = await http.delete<ApiSuccess<Permission>>(`/permissions/${id}`)
    return response.data
  },
}
