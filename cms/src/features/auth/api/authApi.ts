import { http } from '@/shared/api/http'
import type {
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthMeResponse,
  AuthRefreshResponse,
  LoginPayload,
  LogoutPayload,
  RefreshTokenPayload,
} from '../types/auth.types'

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await http.post<AuthLoginResponse>('/auth/login', payload)
    return response.data
  },

  async me() {
    const response = await http.get<AuthMeResponse>('/auth/me')
    return response.data
  },

  async refresh(payload: RefreshTokenPayload) {
    const response = await http.post<AuthRefreshResponse>('/auth/refresh', payload)
    return response.data
  },

  async logout(payload: LogoutPayload) {
    const response = await http.post<AuthLogoutResponse>('/auth/logout', payload)
    return response.data
  },
}
