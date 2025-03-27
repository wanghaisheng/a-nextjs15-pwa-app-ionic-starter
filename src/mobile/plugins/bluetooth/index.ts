/**
 * 蓝牙服务封装
 * 提供统一的蓝牙操作接口
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { BluetoothService } from './service';
import { ServiceConfig } from '../../../core/services/types';

// 创建蓝牙服务上下文
const BluetoothServiceContext = createContext<BluetoothService | null>(null);

// 默认配置
const defaultConfig: ServiceConfig = {
  debug: false,
  mockInWeb: true
};

/**
 * 蓝牙服务提供者组件
 */
export function BluetoothServiceProvider({
  children,
  config = defaultConfig
}: {
  children: React.ReactNode;
  config?: ServiceConfig;
}) {
  const [service] = useState(() => new BluetoothService(config));

  useEffect(() => {
    // 初始化服务
    service.initialize().catch(error => {
      console.error('Failed to initialize Bluetooth service', error);
    });

    // 服务自行管理生命周期，无需清理
  }, [service]);

  return (
    <BluetoothServiceContext.Provider value={service}>
      {children}
    </BluetoothServiceContext.Provider>
  );
}

/**
 * 蓝牙服务Hook
 */
export function useBluetoothService(): BluetoothService {
  const service = useContext(BluetoothServiceContext);
  
  if (!service) {
    throw new Error('useBluetoothService must be used within a BluetoothServiceProvider');
  }
  
  return service;
}

// 导出服务类和类型
export { BluetoothService } from './service';
export * from './types';