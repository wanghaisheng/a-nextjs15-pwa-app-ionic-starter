import { createI18n } from 'next-international'
import type Locales from './dictionaries'

export const {
  useI18n,
  useScopedI18n,
  I18nProvider,
  getStaticParams,
  useCurrentLocale,
  useChangeLocale
} = createI18n<typeof Locales>({
  // 默认从URL路径检测语言 (e.g. /en/about)
  resolveLocale: (locale) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('locale') || locale
    }
    return locale
  }
})