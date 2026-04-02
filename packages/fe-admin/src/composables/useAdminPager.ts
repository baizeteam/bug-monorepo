import { reactive } from 'vue'
import { createPagerState } from '@bug/shared'

/** 管理端表格统一每页条数（PC 分页默认值） */
export const ADMIN_TABLE_PAGE_SIZE = 5

export function useAdminPager() {
  return reactive(createPagerState(1, ADMIN_TABLE_PAGE_SIZE))
}
