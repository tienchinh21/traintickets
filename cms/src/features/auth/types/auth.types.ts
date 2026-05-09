import type { components } from '@/lib/api/schema'

export type LoginPayload = components['schemas']['LoginDto']
export type RefreshTokenPayload = components['schemas']['RefreshTokenDto']
export type LogoutPayload = components['schemas']['LogoutDto']

export type AuthUser = {
  id: string
  email: string | null
  phone: string | null
  fullName: string
  userType: 'CUSTOMER' | 'STAFF' | string
  roles: string[]
  permissions: string[]
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type ApiSuccess<T> = {
  success: true
  data: T
  meta: Record<string, unknown>
  message: string
}

export type AuthLoginData = AuthTokens & {
  user: AuthUser
}

export type AuthLoginResponse = ApiSuccess<AuthLoginData>
export type AuthMeResponse = ApiSuccess<AuthUser>
export type AuthRefreshResponse = ApiSuccess<AuthLoginData>
export type AuthLogoutResponse = ApiSuccess<unknown>
