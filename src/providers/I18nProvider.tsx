'use client'

import { I18nProvider } from '@/core/lib/i18n/config'

export default function AppI18nProvider({
  children,
  locale
}: {
  children: React.ReactNode
  locale: string
}) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>
}