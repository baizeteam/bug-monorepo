/** Bug 状态 */
export enum BugStatus {
  PENDING = 0,
  TAKEN = 1,
  COMMUNICATING = 2,
  RESOLVED = 3,
}

/** 时效状态 */
export enum TimeStatus {
  NORMAL = 0,
  WARNING = 1,
  EXPIRED = 2,
}

/** 用户简要信息（发布人/承接人） */
export interface UserBrief {
  id: number
  username: string
  contactInfo?: string
}

/** Bug 列表项 / 详情 */
export interface BugItem {
  id: number
  title: string
  techStack: string
  description?: string
  expectEffect?: string
  status: number
  timeStatus: number
  publishTime: string
  takeTime?: string
  publisher?: UserBrief | null
  taker?: UserBrief | null
  communityInfo?: string | null
  operationNote?: string | null
}

/** 分页结果 */
export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
