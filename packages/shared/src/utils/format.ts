/** 日期格式化为本地时间 */
export function formatDate(date: Date | string | number, locale = 'zh-CN'): string {
  return new Date(date).toLocaleString(locale)
}
