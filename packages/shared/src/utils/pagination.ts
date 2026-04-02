export interface PagerState {
  page: number
  pageSize: number
  total: number
}

export interface PaginatedPayload<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ScrollMetrics {
  scrollTop: number
  clientHeight: number
  scrollHeight: number
}

export function createPagerState(page = 1, pageSize = 10): PagerState {
  return { page, pageSize, total: 0 }
}

export function resetPagerPage(state: PagerState) {
  state.page = 1
}

export function patchPagerFromPayload<T>(state: PagerState, payload: PaginatedPayload<T>) {
  state.page = payload.page
  state.pageSize = payload.pageSize
  state.total = payload.total
}

export function getTotalPages(state: PagerState): number {
  return Math.max(1, Math.ceil(state.total / state.pageSize))
}

export function hasMoreByPayload<T>(payload: PaginatedPayload<T>): boolean {
  return payload.page * payload.pageSize < payload.total
}

export function shouldTriggerScrollLoad(metrics: ScrollMetrics, threshold = 120): boolean {
  return metrics.scrollTop + metrics.clientHeight >= metrics.scrollHeight - threshold
}
