import { get, post } from '../utils/request'
import type { BugItem, PaginatedResult } from '@bug/shared'

export type { BugItem }

export function getBugList(params?: {
  techStack?: string
  status?: number
  timeStatus?: number
  keyword?: string
  page?: number
  pageSize?: number
}) {
  return get<PaginatedResult<BugItem>>('/api/bug', {
    params,
  })
}

export function getBugDetail(id: number) {
  return get<BugItem>(`/api/bug/${id}`)
}

export function createBug(data: {
  title: string
  techStack: string
  description: string
  expectEffect: string
  communityInfo?: string
}) {
  return post<{ id: number }>('/api/bug', data)
}

export function takeBug(id: number) {
  return post(`/api/bug/${id}/take`)
}

export function updateBugStatus(id: number, status: number, operationNote?: string) {
  return post(`/api/bug/${id}/status`, { status, operationNote })
}
