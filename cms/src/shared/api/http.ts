import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import qs from 'qs'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { AuthRefreshResponse } from '@/features/auth/types/auth.types'
import { env } from '@/shared/config/env'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

export const http = axios.create({
  baseURL: env.apiUrl,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
  timeout: 15_000,
})

export const publicHttp = axios.create({
  baseURL: env.apiUrl,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
  timeout: 15_000,
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        return null
      }

      try {
        const response = await publicHttp.post<AuthRefreshResponse>('/auth/refresh', {
          refreshToken,
        })

        useAuthStore.getState().setSession(response.data.data)
        return response.data.data.accessToken
      } catch {
        useAuthStore.getState().logout()
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/login') ||
      originalRequest?.url?.startsWith('/auth/refresh') ||
      originalRequest?.url?.startsWith('/auth/logout')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      const accessToken = await refreshAccessToken()

      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return http(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)
