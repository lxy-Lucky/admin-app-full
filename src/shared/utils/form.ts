import i18n, { type TFunction } from 'i18next'

/**
 * 表单校验错误国际化工具
 *
 * 将 Zod 校验错误信息映射为 common 命名空间下的 validation 国际化文案。
 * 如果错误信息不是已定义的国际化 Key，则直接显示原始文本。
 */

/**
 * 将校验错误信息转换为当前语言的文案。
 *
 * - 空消息返回 undefined。
 * - 匹配到 common.validation 下的国际化 Key 时，返回翻译结果。
 * - 未匹配到时，保留原始错误信息。
 */
export function translateError(t: TFunction, message?: string): string | undefined {
  if (!message) return undefined
  const key = `validation.${message}`
  return i18n.exists(key, { ns: 'common' }) ? String(t(key as never)) : message
}
