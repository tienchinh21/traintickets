import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'operator'
}

type AuthState = {
  isAuthenticated: boolean
  token: string | null
  user: AuthUser | null
  login: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (email) =>
        set({
          isAuthenticated: true,
          token: 'demo-cms-token',
          user: {
            id: '1',
            name: 'CMS Admin',
            email,
            role: 'admin',
          },
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),
    }),
    {
      name: 'traintickets-cms-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
    },
  ),
)
