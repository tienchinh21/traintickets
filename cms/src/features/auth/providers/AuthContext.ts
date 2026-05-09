import { createContext } from 'react'
import type { AuthUser, LoginPayload } from '../types/auth.types'

type LoginResult = {
  message: string
}

type LogoutResult = {
  message?: string
}

export type AuthContextValue = {
  isAuthenticated: boolean
  isInitializing: boolean
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  login: (payload: LoginPayload) => Promise<LoginResult>
  logout: () => Promise<LogoutResult>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
