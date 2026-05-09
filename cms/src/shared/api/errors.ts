import axios from 'axios'

export type ApiErrorBody = {
  success: false
  error: {
    code: string
    message: string
    details?: string[]
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra') {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const details = error.response?.data?.error?.details
    return details?.[0] ?? error.response?.data?.error?.message ?? error.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
