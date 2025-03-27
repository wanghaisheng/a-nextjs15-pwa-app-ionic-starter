/**
 * 国际化相关Hooks
 * 提供语言切换和本地化功能
 */
import { useCurrentLocale, useChangeLocale } from '../config'
import { useCallback, useEffect } from 'react'
import { SupportedLocale } from '../types'

/**
 * 语言管理Hook
 * 提供当前语言和语言切换功能
 */
export function useLocale() {
  const currentLocale = useCurrentLocale() as SupportedLocale
  const changeLocale = useChangeLocale()
  
  // 切换语言并保存到本地存储
  const setLocale = useCallback((locale: SupportedLocale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)
    }
    changeLocale(locale)
  }, [changeLocale])
  
  // 初始化时从本地存储加载语言设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as SupportedLocale | null
      if (savedLocale && savedLocale !== currentLocale) {
        changeLocale(savedLocale)
      }
    }
  }, [currentLocale, changeLocale])
  
  return {
    currentLocale,
    setLocale,
    isRTL: ['ar', 'he'].includes(currentLocale) // 判断是否为RTL语言
  }
}