/**
 * 国际化相关类型定义
 */

// 本地化字符串类型
export type LocalizedString = {
  [locale: string]: string
} & { default: string }

// 字典类型
export type Dictionary = {
  [key: string]: string | Dictionary
}

// 支持的语言类型
export type SupportedLocale = 'en' | 'zh' | 'ja'

// 字典模块类型
export interface DictionaryModule {
  common: Dictionary
  [key: string]: Dictionary
}