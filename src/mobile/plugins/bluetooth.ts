/**
 * 蓝牙功能Capacitor插件封装
 * 提供统一的蓝牙操作接口
 */
import { BleClient, BleDevice, ScanResult } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

// 扫描选项接口
export interface ScanOptions {
  services?: string[];
  namePrefix?: string;
  timeoutMs?: number;
}

// 连接选项接口
export interface ConnectOptions {
  timeout?: number;
}

/**
 * 蓝牙服务类
 * 封装Capacitor蓝牙插件，提供统一的API
 */
export class BluetoothService {
  private static instance: BluetoothService;
  private isInitialized = false;
  
  /**
   * 获取单例实例
   */
  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }
  
  /**
   * 初始化蓝牙服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await BleClient.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
      throw error;
    }
  }
  
  /**
   * 检查蓝牙是否可用
   */
  public async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Bluetooth is only available on native platforms');
      return false;
    }
    
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('Bluetooth is not available:', error);
      return false;
    }
  }
  
  /**
   * 请求蓝牙权限
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      await this.initialize();
      await BleClient.requestLEScan(
        { services: [] },
        () => {}
      );
      await BleClient.stopLEScan();
      return true;
    } catch (error) {
      console.error('Failed to request Bluetooth permissions:', error);
      return false;
    }
  }
  
  /**
   * 扫描蓝牙设备
   */
  public async scan(options: ScanOptions = {}): Promise<BleDevice[]> {
    try {
      await this.initialize();
      
      const devices: BleDevice[] = [];
      
      // 设置扫描回调
      await BleClient.requestLEScan(
        {
          services: options.services || [],
          namePrefix: options.namePrefix,
        },
        (result: ScanResult) => {
          // 检查设备是否已存在
          const exists = devices.some(d => d.deviceId === result.device.deviceId);
          if (!exists) {
            devices.push(result.device);
          }
        }
      );
      
      // 设置超时
      const timeoutMs = options.timeoutMs || 5000;
      await new Promise(resolve => setTimeout(resolve, timeoutMs));
      
      // 停止扫描
      await BleClient.stopLEScan();
      
      return devices;
    } catch (error) {
      console.error('Failed to scan for Bluetooth devices:', error);
      throw error;
    }
  }
  
  /**
   * 连接到蓝牙设备
   */
  public async connect(deviceId: string, options: ConnectOptions = {}): Promise<void> {
    try {
      await this.initialize();
      await BleClient.connect(deviceId, options);
    } catch (error) {
      console.error(`Failed to connect to device ${deviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * 断开蓝牙设备连接
   */
  public async disconnect(deviceId: string): Promise<void> {
    try {
      await BleClient.disconnect(deviceId);
    } catch (error) {
      console.error(`Failed to disconnect from device ${deviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * 读取特征值
   */
  public async read(deviceId: string, service: string, characteristic: string): Promise<DataView> {
    try {
      return await BleClient.read(deviceId, service, characteristic);
    } catch (error) {
      console.error(`Failed to read characteristic ${characteristic}:`, error);
      throw error;
    }
  }
  
  /**
   * 写入特征值
   */
  public async write(deviceId: string, service: string, characteristic: string, value: DataView): Promise<void> {
    try {
      await BleClient.write(deviceId, service, characteristic, value);
    } catch (error) {
      console.error(`Failed to write to characteristic ${characteristic}:`, error);
      throw error;
    }
  }
  
  /**
   * 启动特征值通知
   */
  public async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void
  ): Promise<void> {
    try {
      await BleClient.startNotifications(deviceId, service, characteristic, callback);
    } catch (error) {
      console.error(`Failed to start notifications for characteristic ${characteristic}:`, error);
      throw error;
    }
  }
  
  /**
   * 停止特征值通知
   */
  public async stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void> {
    try {
      await BleClient.stopNotifications(deviceId, service, characteristic);
    } catch (error) {
      console.error(`Failed to stop notifications for characteristic ${characteristic}:`, error);
      throw error;
    }
  }
}

// 导出单例实例
export const bluetoothService = BluetoothService.getInstance();