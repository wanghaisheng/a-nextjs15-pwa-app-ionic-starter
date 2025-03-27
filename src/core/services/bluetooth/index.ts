/**
 * 蓝牙服务模块
 * 提供跨平台的蓝牙功能访问
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { BluetoothDevice } from './types';

// 在移动端使用原生插件，在Web端使用模拟实现
const getBluetoothService = async () => {
  if (Capacitor.isNativePlatform()) {
    // 动态导入移动端实现
    const { bluetoothService } = await import('@/mobile/plugins/bluetooth');
    return bluetoothService;
  } else {
    // 动态导入Web模拟实现
    const { webBluetoothService } = await import('./web-fallback');
    return webBluetoothService;
  }
};

// 蓝牙服务上下文类型
type BluetoothServiceContextType = {
  isAvailable: boolean;
  scan: (options?: any) => Promise<BluetoothDevice[]>;
  connect: (deviceId: string, options?: any) => Promise<void>;
  disconnect: (deviceId: string) => Promise<void>;
  read: (deviceId: string, service: string, characteristic: string) => Promise<DataView>;
  write: (deviceId: string, service: string, characteristic: string, value: DataView) => Promise<void>;
  startNotifications: (deviceId: string, service: string, characteristic: string, callback: (value: DataView) => void) => Promise<void>;
  stopNotifications: (deviceId: string, service: string, characteristic: string) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  addScanListener: (callback: (device: BluetoothDevice) => void) => void;
};

// 创建蓝牙服务上下文
const BluetoothServiceContext = createContext<BluetoothServiceContextType | null>(null);

// 蓝牙服务提供者组件
export function BluetoothServiceProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState<any | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [scanListeners, setScanListeners] = useState<((device: BluetoothDevice) => void)[]>([]);

  // 初始化蓝牙服务
  useEffect(() => {
    let mounted = true;

    const initService = async () => {
      try {
        const bluetoothService = await getBluetoothService();
        if (mounted) {
          setService(bluetoothService);
          const available = await bluetoothService.isAvailable();
          setIsAvailable(available);
        }
      } catch (error) {
        console.error('Failed to initialize Bluetooth service:', error);
        if (mounted) {
          setIsAvailable(false);
        }
      }
    };

    initService();

    return () => {
      mounted = false;
    };
  }, []);

  // 扫描设备并通知监听器
  const scan = async (options?: any) => {
    if (!service) return [];

    try {
      const devices = await service.scan(options);
      // 通知所有监听器
      devices.forEach(device => {
        scanListeners.forEach(listener => listener(device));
      });
      return devices;
    } catch (error) {
      console.error('Scan error:', error);
      return [];
    }
  };

  // 添加扫描监听器
  const addScanListener = (callback: (device: BluetoothDevice) => void) => {
    setScanListeners(prev => [...prev, callback]);
  };

  // 连接到设备
  const connect = async (deviceId: string, options?: any) => {
    if (!service) throw new Error('Bluetooth service not initialized');
    return service.connect(deviceId, options);
  };

  // 断开连接
  const disconnect = async (deviceId: string) => {
    if (!service) throw new Error('Bluetooth service not initialized');
    return service.disconnect(deviceId);
  };

  // 读取特征值
  const read = async (deviceId: string, serviceId: string, characteristicId: string) => {
    if (!service) throw new Error('Bluetooth service not initialized');
    return service.read(deviceId, serviceId, characteristicId);
  };

  // 写入特征值
  const write = async (deviceId: string, serviceId: string, characteristicId: string, value: DataView) => {
    if (!service) throw new Error('Bluetooth service not initialized');
    return service.write(deviceId, serviceId, characteristicId, value);
  };

  // 启动通知
  const startNotifications = async (deviceId: string, serviceId: string, characteristicId: string, callback: (value: DataView) => void) => {
    if (!service) throw new Error('Bluetooth service not initialized');
    return service.startNotifications(deviceId, serviceId, characteristicId, callback);
  };

  // 停止通知
  const stopNotifications = async (deviceId: string, serviceId: string, characteristicId: string) => {
    if (!service) throw new Error('Bluetooth service not initialized');
    return service.stopNotifications(deviceId, serviceId, characteristicId);
  };

  // 请求权限
  const requestPermissions = async () => {
    if (!service) return false;
    return service.requestPermissions();
  };

  // 提供蓝牙服务上下文
  return (
    <BluetoothServiceContext.Provider
      value={{
        isAvailable,
        scan,
        connect,
        disconnect,
        read,
        write,
        startNotifications,
        stopNotifications,
        requestPermissions,
        addScanListener
      }}
    >
      {children}
    </BluetoothServiceContext.Provider>
  );
}

// 使用蓝牙服务的Hook
export function useBluetoothService() {
  const context = useContext(BluetoothServiceContext);
  if (!context) {
    throw new Error('useBluetoothService must be used within a BluetoothServiceProvider');
  }
  return context;
}