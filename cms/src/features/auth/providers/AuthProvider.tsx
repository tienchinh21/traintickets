import { Spin } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import type { LoginPayload } from '../types/auth.types'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const setUser = useAuthStore((state) => state.setUser)
  const clearSession = useAuthStore((state) => state.logout)

  useEffect(() => {
    let isMounted = true

    const hydrateUser = async () => {
      if (!accessToken) {
        if (isAuthenticated) {
          clearSession()
        }

        setIsInitializing(false)
        return
      }

      try {
        const response = await authApi.me()

        if (isMounted) {
          setUser(response.data)
        }
      } catch {
        if (isMounted) {
          clearSession()
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    hydrateUser()

    return () => {
      isMounted = false
    }
  }, [accessToken, clearSession, isAuthenticated, setUser])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload)
      setSession(response.data)
      return { message: response.message }
    },
    [setSession],
  )

  const logout = useCallback(async () => {
    if (!refreshToken) {
      clearSession()
      return {}
    }

    try {
      const response = await authApi.logout({ refreshToken })
      return { message: response.message }
    } finally {
      clearSession()
    }
  }, [clearSession, refreshToken])

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user],
  )

  const hasRole = useCallback((role: string) => user?.roles.includes(role) ?? false, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isInitializing,
      user,
      accessToken,
      refreshToken,
      login,
      logout,
      hasPermission,
      hasRole,
    }),
    [
      accessToken,
      hasPermission,
      hasRole,
      isAuthenticated,
      isInitializing,
      login,
      logout,
      refreshToken,
      user,
    ],
  )

  if (isInitializing) {
    return (
      <div className="auth-loading">
        <Spin />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
