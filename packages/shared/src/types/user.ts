/** 用户角色 */
export enum UserRole {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

/** 用户状态 */
export enum UserStatus {
  NORMAL = 0,
  DISABLED = 1,
}

/** 用户信息（登录/接口返回） */
export interface UserInfo {
  id: number
  username: string
  phone?: string
  email?: string
  role: number
}
