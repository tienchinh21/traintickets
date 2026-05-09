import axios from 'axios'

export type ApiErrorBody = {
  success: false
  error: {
    code: string
    message: string
    details?: string[]
  }
}

const clientErrorMessages: Record<string, string> = {
  'Network Error': 'Không kết nối được tới máy chủ. Vui lòng kiểm tra API hoặc mạng.',
  'timeout of 15000ms exceeded': 'Kết nối tới máy chủ quá thời gian chờ. Vui lòng thử lại.',
}

function isLocalizedMessage(message: string) {
  return /[À-ỹ]/.test(message)
}

function getAxiosErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return null

  const details = error.response?.data?.error?.details?.filter(Boolean)
  const serverMessage = error.response?.data?.error?.message

  if (details?.length) return details[0]
  if (serverMessage) return serverMessage

  if (error.code === 'ECONNABORTED') {
    return 'Kết nối tới máy chủ quá thời gian chờ. Vui lòng thử lại.'
  }

  return clientErrorMessages[error.message] ?? null
}

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra') {
  const apiMessage = getAxiosErrorMessage(error)

  if (apiMessage) {
    return apiMessage
  }

  if (error instanceof Error) {
    if (isLocalizedMessage(error.message)) return error.message

    return clientErrorMessages[error.message] ?? fallback
  }

  return fallback
}
