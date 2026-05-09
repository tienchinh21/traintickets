export type ApiSuccess<T> = {
  success: true
  data: T
  meta: Record<string, unknown>
  message: string
}
