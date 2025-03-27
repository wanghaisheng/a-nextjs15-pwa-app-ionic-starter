/**
 * 数据库工厂
 * 根据环境和平台创建适合的数据库客户端
 */
import { Capacitor } from '@capacitor/core'
import { DatabaseEngine, IDatabaseClient, DatabaseConfig } from './interfaces'

/**
 * 创建数据库客户端
 * @param engine 数据库引擎类型
 * @param config 数据库配置
 * @returns 数据库客户端实例
 */
export async function createDatabaseClient(engine: DatabaseEngine, config: DatabaseConfig = {}): Promise<IDatabaseClient> {
  // 移动端优先使用SQLite
  if (Capacitor.isNativePlatform() && engine === 'indexeddb') {
    engine = 'sqlite'
  }

  // 根据引擎类型动态导入相应的数据库客户端
  switch (engine) {
    case 'mock':
      const { MockDatabaseClient } = await import('./mock')
      return new MockDatabaseClient(config)
    case 'indexeddb':
      const { IndexedDBClient } = await import('./local')
      return new IndexedDBClient(config)
    case 'sqlite':
      const { SQLiteClient } = await import('./local/sqlite')
      return new SQLiteClient(config)
    case 'supabase':
      const { SupabaseClient } = await import('./cloud/supabase')
      return new SupabaseClient(config)
    default:
      throw new Error(`不支持的数据库引擎: ${engine}`)
  }
}