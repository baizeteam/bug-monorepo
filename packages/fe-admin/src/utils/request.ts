import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { parseApiResponseError, parseHttpClientError, type ApiResponse } from '@bug/shared'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const DEVICE_ID_KEY = 'device_id'

function getDeviceId() {
  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) return existing
  const generated =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(DEVICE_ID_KEY, generated)
  return generated
}

export const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

function redirectToLogin() {
  localStorage.removeItem('token')
  const currentPath = window.location.pathname + window.location.search
  const isGuestPage = window.location.pathname === '/login' || window.location.pathname === '/register'
  if (isGuestPage) return
  const query = currentPath && currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''
  window.location.href = `/login${query}`
}

/** 请求拦截器 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers['x-device-id'] = getDeviceId()
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err),
)

/** 响应拦截器：统一处理 ApiResponse 格式 */
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<unknown>
    const normalized = parseApiResponseError(res)
    if (!normalized) return response
    if (normalized.unauthorized) {
      redirectToLogin()
      return Promise.reject(new Error(normalized.message || '登录已过期，请重新登录'))
    }
    return Promise.reject(new Error(normalized.message))
  },
  (err) => {
    const normalized = parseHttpClientError(err)
    if (normalized.unauthorized) {
      redirectToLogin()
    }
    return Promise.reject(new Error(normalized.message))
  },
)

/** 请求方法：直接返回 data，自动解包 */
export async function get<T>(url: string, config?: Parameters<typeof request.get>[1]) {
  const { data } = await request.get<ApiResponse<T>>(url, config)
  return data.data
}

export async function post<T>(url: string, body?: unknown, config?: Parameters<typeof request.post>[2]) {
  const { data } = await request.post<ApiResponse<T>>(url, body, config)
  return data.data
}

export async function put<T>(url: string, body?: unknown, config?: Parameters<typeof request.put>[2]) {
  const { data } = await request.put<ApiResponse<T>>(url, body, config)
  return data.data
}

export async function del<T>(url: string, config?: Parameters<typeof request.delete>[1]) {
  const { data } = await request.delete<ApiResponse<T>>(url, config)
  return data.data
}
