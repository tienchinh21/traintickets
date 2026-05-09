import { http, publicHttp } from '@/shared/api/http'
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
    const response = await publicHttp.post<AuthLoginResponse>('/auth/login', payload)
    return response.data
  },

  async me() {
    const response = await http.get<AuthMeResponse>('/auth/me')
    return response.data
  },

  async refresh(payload: RefreshTokenPayload) {
    const response = await publicHttp.post<AuthRefreshResponse>('/auth/refresh', payload)
    return response.data
  },

  async logout(payload: LogoutPayload) {
    const response = await publicHttp.post<AuthLogoutResponse>('/auth/logout', payload)
    return response.data
  },
}
