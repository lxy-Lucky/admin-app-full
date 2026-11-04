import i18n, { type TFunction } from 'i18next'

/**
 * Zod messages are i18n keys under `common:validation.*` ('required', 'email', ...).
 * Unknown messages are shown as-is, so plain-text messages keep working.
 */
export function translateError(t: TFunction, message?: string): string | undefined {
  if (!message) return undefined
  const key = `validation.${message}`
  return i18n.exists(key, { ns: 'common' }) ? String(t(key as never)) : message
}
