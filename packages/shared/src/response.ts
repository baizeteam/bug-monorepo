/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 成功响应 code */
export const SUCCESS_CODE = 0

/** 创建成功响应 */
export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: SUCCESS_CODE, message, data }
}

/** 创建失败响应 */
export function fail(code: number, message: string, data: null = null): ApiResponse<null> {
  return { code, message, data }
}
