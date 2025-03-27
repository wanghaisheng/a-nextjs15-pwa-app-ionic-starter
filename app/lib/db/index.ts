/**
 * 数据库工厂
 * 根据环境变量选择合适的数据库实现
 */
import { DatabaseClient, DatabaseConfig } from './types';
import mockDatabase from './mock';
import localDatabase from './local';
import cloudDatabase from './cloud';

/**
 * 数据库环境类型
 */
export enum DatabaseEnvironment {
  Mock = 'mock',
  Local = 'local',
  Cloud = 'cloud',
}

/**
 * 获取当前环境
 */
export function getDatabaseEnvironment(): DatabaseEnvironment {
  // 从环境变量获取数据库环境设置
  const env = process.env.NEXT_PUBLIC_DATABASE_ENV;
  
  if (env === 'cloud') {
    return DatabaseEnvironment.Cloud;
  } else if (env === 'local') {
    return DatabaseEnvironment.Local;
  } else {
    // 默认使用Mock环境
    return DatabaseEnvironment.Mock;
  }
}

/**
 * 获取数据库客户端实例
 */
export function getDatabaseClient(config?: DatabaseConfig): DatabaseClient {
  const environment = getDatabaseEnvironment();
  
  switch (environment) {
    case DatabaseEnvironment.Cloud:
      return cloudDatabase;
    case DatabaseEnvironment.Local:
      return localDatabase;
    case DatabaseEnvironment.Mock:
    default:
      return mockDatabase;
  }
}

// 导出默认数据库客户端实例
const db = getDatabaseClient();
export default db;