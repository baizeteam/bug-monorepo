import { get } from '../utils/request'

export function getProfile() {
  return get<{
    id: number
    username: string
    phone: string
    email: string
    intro: string
    contactInfo: string
    role: number
    status: number
  }>('/api/user/profile')
}
