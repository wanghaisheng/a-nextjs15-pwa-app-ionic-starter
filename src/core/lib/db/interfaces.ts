/**
 * 数据库接口定义
 * 提供统一的数据访问接口，支持国际化数据处理
 */
import { LocalizedString } from '../../i18n/types'
import { Product } from '../../../models/product'

/**
 * 数据库客户端接口
 */
export interface IDatabaseClient {
  // 基础操作
  initialize(): Promise<void>
  close(): Promise<void>
  
  // 产品相关操作
  getProducts(): Promise<Product[]>
  getProduct(id: string): Promise<Product | null>
  
  // 国际化数据处理
  getLocalizedProducts(locale: string): Promise<Product[]>
  getLocalizedProduct(id: string, locale: string): Promise<Product | null>
  
  // 创建支持多语言的产品
  createProduct(product: {
    name: LocalizedString
    description: LocalizedString
    price: number
  }): Promise<Product>
  
  // 更新产品
  updateProduct(id: string, product: Partial<{
    name: LocalizedString
    description: LocalizedString
    price: number
  }>): Promise<Product>
  
  // 删除产品
  deleteProduct(id: string): Promise<boolean>
}

/**
 * 数据库引擎类型
 */
export type DatabaseEngine = 
  | 'mock'
  | 'indexeddb'
  | 'sqlite'
  | 'supabase'
  | 'postgres'
  | 'mysql'
  | 'cloudflare-d1'

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
  debug?: boolean
  mockInWeb?: boolean
}