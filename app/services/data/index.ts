/**
 * 数据服务层
 * 提供统一的数据访问接口，实现数据和页面分离
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { DataService } from './data-service';
import { ServiceConfig } from '../types';

// 创建数据服务上下文
const DataServiceContext = createContext<DataService | null>(null);

// 默认配置
const defaultConfig: ServiceConfig = {
  debug: false,
  mockInWeb: true
};

/**
 * 数据服务提供者组件
 */
export function DataServiceProvider({
  children,
  config = defaultConfig
}: {
  children: React.ReactNode;
  config?: ServiceConfig;
}) {
  const [service] = useState(() => new DataService(config));

  useEffect(() => {
    // 初始化服务
    service.initialize().catch(error => {
      console.error('Failed to initialize Data service', error);
    });

    // 服务自己管理生命周期，不需要清理
  }, [service]);

  return (
    <DataServiceContext.Provider value={service}>
      {children}
    </DataServiceContext.Provider>
  );
}

/**
 * 使用数据服务的Hook
 */
export function useDataService(): DataService {
  const service = useContext(DataServiceContext);
  
  if (!service) {
    throw new Error('useDataService must be used within a DataServiceProvider');
  }
  
  return service;
}

// 导出服务类和类型
export { DataService } from './data-service';
export * from './types';