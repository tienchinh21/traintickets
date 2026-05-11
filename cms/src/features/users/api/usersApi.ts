import { http } from '@/shared/api/http'
import type { ApiSuccess } from '@/shared/api/types'
import type {
  UpdateUserPayload,
  User,
  UserFormValues,
  UserListMeta,
  UserListQuery,
} from '../types/user.types'

type UserListResponse = ApiSuccess<User[]> & {
  meta: UserListMeta
}

export const usersApi = {
  async getUsers(params: UserListQuery) {
    const response = await http.get<UserListResponse>('/users', { params })
    return response.data
  },

  async getUser(id: string) {
    const response = await http.get<ApiSuccess<User>>(`/users/${id}`)
    return response.data
  },

  async createUser(payload: UserFormValues) {
    const response = await http.post<ApiSuccess<null>>('/users', payload)
    return response.data
  },

  async updateUser(id: string, payload: UpdateUserPayload) {
    const response = await http.patch<ApiSuccess<null>>(`/users/${id}`, payload)
    return response.data
  },

  async deleteUser(id: string) {
    const response = await http.delete<ApiSuccess<null>>(`/users/${id}`)
    return response.data
  },
}
