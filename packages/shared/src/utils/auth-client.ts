import type { ApiResponse } from '../response'

export interface NormalizedClientError {
  unauthorized: boolean
  message: string
}

export function parseApiResponseError(
  res: ApiResponse<unknown>,
  unauthorizedCode = 401,
): NormalizedClientError | null {
  if (res.code === 0) return null
  return {
    unauthorized: res.code === unauthorizedCode,
    message: res.message || '请求失败',
  }
}

export function parseHttpClientError(err: unknown, unauthorizedCode = 401): NormalizedClientError {
  const e = err as {
    response?: {
      status?: number
      data?: { code?: number; message?: string }
    }
    message?: string
  }
  const status = e.response?.status
  const code = e.response?.data?.code
  return {
    unauthorized: status === 401 || code === unauthorizedCode,
    message: e.response?.data?.message || e.message || '网络错误',
  }
}
