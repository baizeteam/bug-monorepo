import { BugStatus, TimeStatus, UserRole, UserStatus } from '../types'
import { OperationType } from '../types/operation'

/** 用户角色文案 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: '普通用户',
  [UserRole.ADMIN]: '普通管理员',
  [UserRole.SUPER_ADMIN]: '超级管理员',
}

/** 用户状态文案 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.NORMAL]: '正常',
  [UserStatus.DISABLED]: '已禁用',
}

/** Bug 状态文案 */
export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  [BugStatus.PENDING]: '待解决',
  [BugStatus.TAKEN]: '已承接',
  [BugStatus.COMMUNICATING]: '沟通中',
  [BugStatus.RESOLVED]: '已解决',
}

/** 时效状态文案 */
export const TIME_STATUS_LABELS: Record<TimeStatus, string> = {
  [TimeStatus.NORMAL]: '正常',
  [TimeStatus.WARNING]: '即将超期',
  [TimeStatus.EXPIRED]: '已超期',
}

/** 操作类型文案 */
export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  [OperationType.BUG_PUBLISH]: '发布订单',
  [OperationType.BUG_TAKE]: '承接订单',
  [OperationType.STATUS_UPDATE]: '状态更新',
  [OperationType.MANUAL_INTERVENTION]: '人工介入',
  [OperationType.USER_DISABLE]: '禁用用户',
  [OperationType.USER_CREATE]: '创建用户',
  [OperationType.USER_DELETE]: '删除用户',
}

/** 默认时效规则名称（statusType: 1=承接后, 2=沟通中） */
export const DEFAULT_TIME_RULE_NAMES: Record<number, string> = {
  1: '承接后超期规则',
  2: '沟通中超期规则',
}
