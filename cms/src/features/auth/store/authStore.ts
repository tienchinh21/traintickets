import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthTokens, AuthUser } from '../types/auth.types'

type AuthState = {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  setSession: (session: AuthTokens & { user: AuthUser }) => void
  setUser: (user: AuthUser) => void
  setTokens: (tokens: AuthTokens) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user,
        }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: 'traintickets-cms-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
