import axios from 'axios'
import qs from 'qs'
import { useAuthStore } from '@/features/auth/store/authStore'
import { env } from '@/shared/config/env'

export const http = axios.create({
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

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  },
)
