import { http } from '@/shared/api/http'
import type { ApiSuccess } from '@/shared/api/types'
import type { UpdateUserPayload, User, UserFormValues } from '../types/user.types'

export const usersApi = {
  async getUsers() {
    const response = await http.get<ApiSuccess<User[]>>('/users')
    return response.data
  },

  async getUser(id: string) {
    const response = await http.get<ApiSuccess<User>>(`/users/${id}`)
    return response.data
  },

  async createUser(payload: UserFormValues) {
    const response = await http.post<ApiSuccess<User>>('/users', payload)
    return response.data
  },

  async updateUser(id: string, payload: UpdateUserPayload) {
    const response = await http.patch<ApiSuccess<User>>(`/users/${id}`, payload)
    return response.data
  },

  async deleteUser(id: string) {
    const response = await http.delete<ApiSuccess<unknown>>(`/users/${id}`)
    return response.data
  },
}
