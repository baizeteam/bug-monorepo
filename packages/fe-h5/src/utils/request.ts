import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@bug/shared'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err),
)

request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<unknown>
    if (res.code !== 0) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  (err) => {
    const message = err.response?.data?.message || err.message || '网络错误'
    return Promise.reject(new Error(message))
  },
)

export async function get<T>(url: string, config?: Parameters<typeof request.get>[1]) {
  const { data } = await request.get<ApiResponse<T>>(url, config)
  return data.data
}

export async function post<T>(url: string, body?: unknown, config?: Parameters<typeof request.post>[2]) {
  const { data } = await request.post<ApiResponse<T>>(url, body, config)
  return data.data
}
