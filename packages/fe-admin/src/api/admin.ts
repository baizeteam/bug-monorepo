import { get, post, put, del } from '../utils/request'
import { BugStatus, TimeStatus, UserRole, UserStatus } from '@bug/shared'

export interface AdminOrderItem {
  id: number
  title: string
  techStack: string
  status: number
  timeStatus: number
  publishTime: string
  takeTime?: string | null
  publisher?: { id: number; username: string; contactInfo?: string } | null
  taker?: { id: number; username: string; contactInfo?: string } | null
}

export function getAdminOrders(params?: {
  page?: number
  pageSize?: number
  status?: BugStatus
  timeStatus?: TimeStatus
  keyword?: string
}) {
  return get<{ list: AdminOrderItem[]; total: number; page: number; pageSize: number }>(
    '/api/admin/orders',
    { params },
  )
}

export interface AdminOrderDetail {
  id: number
  title: string
  techStack: string
  description: string
  expectEffect: string
  status: number
  timeStatus: number
  publishTime: string
  takeTime: string | null
  lastUpdateTime: string
  communityInfo: string | null
  operationNote: string | null
  publisher?: { id: number; username: string; contactInfo?: string } | null
  taker?: { id: number; username: string; contactInfo?: string } | null
}

export function getAdminOrderById(id: number) {
  return get<AdminOrderDetail>(`/api/admin/orders/${id}`)
}

export interface AdminOrderStats {
  total: number
  byStatus: Record<number, number>
}

export function getAdminOrderStats() {
  return get<AdminOrderStats>('/api/admin/orders/stats')
}

export function getOverdueBugs(timeStatus?: number) {
  return get<any[]>(
    '/api/admin/overdue-bugs',
    timeStatus !== undefined ? { params: { timeStatus } } : undefined,
  )
}

export function manualIntervention(bugId: number, status: number, operationNote: string) {
  return post('/api/admin/manual-intervention', { bugId, status, operationNote })
}

export function getTimeRules() {
  return get('/api/admin/time-rules')
}

export interface OperationLogItem {
  id: number
  operatorId: number
  bugId: number | null
  operationType: number
  operationContent: string
  operationTime: string
  operator?: { id: number; username: string } | null
  bug?: { id: number; title: string } | null
}

export function getOperationLogs(bugId?: number, page?: number, pageSize?: number) {
  return get<{ list: OperationLogItem[]; total: number; page: number; pageSize: number }>(
    '/api/admin/operation-logs',
    { params: { bugId, page, pageSize } },
  )
}

export interface AdminUser {
  id: number
  username: string
  phone: string
  email: string
  role: number
  status: number
  contactInfo?: string
  createTime: string
}

export function getAdminUserList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
  role?: UserRole
  status?: UserStatus
}) {
  return get<{ list: AdminUser[]; total: number; page: number; pageSize: number }>(
    '/api/admin/users',
    { params },
  )
}

export function getAdminUserById(id: number) {
  return get<AdminUser & { intro?: string; updateTime: string }>(`/api/admin/users/${id}`)
}

export function createAdminUser(data: {
  username: string
  phone: string
  email: string
  password: string
  contactInfo?: string
  intro?: string
  role?: UserRole
}) {
  return post<{ id: number }>('/api/admin/users', data)
}

export function updateAdminUser(id: number, data: Partial<{
  username: string
  phone: string
  email: string
  password: string
  contactInfo: string
  intro: string
}>) {
  return put<{ id: number }>(`/api/admin/users/${id}`, data)
}

export function softDeleteAdminUser(id: number) {
  return del(`/api/admin/users/${id}`)
}

export function assignUserRole(userId: number, role: UserRole) {
  return put(`/api/admin/users/${userId}/role`, { role })
}

export function updateUserStatus(userId: number, status: UserStatus) {
  return put(`/api/admin/users/${userId}/status`, { status })
}

export function resetDatabase() {
  return post<{ message: string }>('/api/admin/db/reset')
}
