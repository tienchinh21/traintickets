import axios from 'axios'

export type ApiErrorBody = {
  success: false
  error: {
    code: string
    message: string
    details?: string[]
  }
}

export type NormalizedApiError = {
  code: string
  message: string
  details: string[]
}

const clientErrorMessages: Record<string, string> = {
  'Network Error': 'Không kết nối được tới máy chủ. Vui lòng kiểm tra API hoặc mạng.',
  'timeout of 15000ms exceeded': 'Kết nối tới máy chủ quá thời gian chờ. Vui lòng thử lại.',
}

function isLocalizedMessage(message: string) {
  return /[À-ỹ]/.test(message)
}

function normalizeDetails(details: unknown) {
  if (!Array.isArray(details)) return []

  return details.filter((detail): detail is string => typeof detail === 'string' && detail.trim().length > 0)
}

function getAxiosApiError(error: unknown): NormalizedApiError | null {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return null

  const apiError = error.response?.data?.error

  if (apiError?.message || apiError?.details?.length) {
    return {
      code: apiError.code || 'UNKNOWN_API_ERROR',
      message: apiError.message || 'Dữ liệu không hợp lệ',
      details: normalizeDetails(apiError.details),
    }
  }

  if (error.code === 'ECONNABORTED') {
    return {
      code: 'REQUEST_TIMEOUT',
      message: 'Kết nối tới máy chủ quá thời gian chờ. Vui lòng thử lại.',
      details: [],
    }
  }

  const message = clientErrorMessages[error.message]
  if (!message) return null

  return {
    code: 'NETWORK_ERROR',
    message,
    details: [],
  }
}

export function getApiError(error: unknown, fallback = 'Có lỗi xảy ra'): NormalizedApiError {
  const apiError = getAxiosApiError(error)

  if (apiError) {
    return apiError
  }

  if (error instanceof Error) {
    if (isLocalizedMessage(error.message)) {
      return {
        code: 'CLIENT_ERROR',
        message: error.message,
        details: [],
      }
    }

    const message = clientErrorMessages[error.message] ?? fallback

    return {
      code: 'UNKNOWN_CLIENT_ERROR',
      message,
      details: [],
    }
  }

  return {
    code: 'UNKNOWN_CLIENT_ERROR',
    message: fallback,
    details: [],
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra') {
  const apiError = getApiError(error, fallback)

  if (!apiError.details.length) {
    return apiError.message
  }

  return `${apiError.message}: ${apiError.details.join('; ')}`
}
