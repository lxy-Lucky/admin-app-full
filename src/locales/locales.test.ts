import dayjs from 'dayjs'
import i18n, { changeLanguage, useLocaleStore } from '@/locales'

afterEach(async () => {
  await changeLanguage('zh-CN')
})

describe('locales', () => {
  it('defaults to zh-CN', () => {
    expect(i18n.language).toBe('zh-CN')
    expect(i18n.t('hello')).toBe('你好')
  })

  it('changeLanguage syncs i18next, dayjs, <html lang> and store', async () => {
    await changeLanguage('ja-JP')
    expect(i18n.t('hello')).toBe('こんにちは')
    expect(i18n.t('error:network')).toContain('ネットワーク')
    expect(dayjs.locale()).toBe('ja')
    expect(document.documentElement.lang).toBe('ja-JP')
    expect(useLocaleStore.getState().language).toBe('ja-JP')
  })
})
