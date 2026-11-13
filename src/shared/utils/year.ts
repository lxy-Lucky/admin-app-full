/**
 * 生成年度选择选项。
 *
 * 从当前年份开始，连续生成 count 个年份选项。
 */
export function getYearOptions(count = 15) {
  const start = new Date().getFullYear()
  return Array.from({ length: count }, (_, i) => ({ value: start + i, label: String(start + i) }))
}
