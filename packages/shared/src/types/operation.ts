/** 操作类型（全局审计日志） */
export enum OperationType {
  BUG_PUBLISH = 0,      // 谁发布了一个订单
  BUG_TAKE = 1,         // 谁接单
  STATUS_UPDATE = 2,    // 订单状态变更（含完成）
  MANUAL_INTERVENTION = 3,
  USER_DISABLE = 4,
  USER_CREATE = 5,      // 创建了新用户
  USER_DELETE = 6,      // 删除了用户（软删）
}
