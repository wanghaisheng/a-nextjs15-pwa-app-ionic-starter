/**
 * 产品数据模型
 * 支持国际化字段
 */
import { LocalizedString } from '../lib/i18n/types'

export interface Product {
  id: string
  name: LocalizedString
  description: LocalizedString
  price: number
}