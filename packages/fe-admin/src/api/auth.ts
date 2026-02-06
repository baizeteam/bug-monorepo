import { post } from '../utils/request'
import type { UserInfo } from '@bug/shared'

export interface LoginRes {
  token: string
  user: UserInfo
}

export function login(account: string, password: string) {
  return post<LoginRes>('/api/auth/login', { account, password })
}

export function register(data: {
  username: string
  phone: string
  email: string
  password: string
  contactInfo?: string
  intro?: string
}) {
  return post('/api/user/register', data)
}
