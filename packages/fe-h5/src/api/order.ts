import { get } from '../utils/request'

export interface MyOrderItem {
  id: number
  title: string
  techStack: string
  status: number
  timeStatus: number
  publishTime: string
  takeTime: string | null
  publisher: { id: number; username: string; contactInfo?: string } | null
}

export function getMyOrders(params?: { page?: number; pageSize?: number }) {
  return get<{ list: MyOrderItem[]; total: number; page: number; pageSize: number }>(
    '/api/order/my',
    { params },
  )
}
