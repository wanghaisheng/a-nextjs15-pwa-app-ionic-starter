/**
 * 蓝牙服务实现
 * 封装Capacitor蓝牙LE插件，提供统一的API
 */
import { BleClient, BleDevice, ScanResult, dataViewToText, numberToUUID } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { ServiceConfig } from '../../../core/services/types';
import { BluetoothDevice, ScanOptions, ConnectOptions, BluetoothCharacteristic } from './types';
import { WebBluetoothService } from './web-fallback';

/**
 * 蓝牙服务类
 * 封装Capacitor蓝牙插件，提供统一的API
 */
export class BluetoothService {
  private isInitialized = false;
  private scanListeners: ((device: BluetoothDevice) => void)[] = [];
  private webFallback: WebBluetoothService | null = null;
  private config: ServiceConfig;

  constructor(config: ServiceConfig = {}) {
    this.config = config;
    
    // 在Web环境中创建回退实现
    if (!Capacitor.isNativePlatform() && config.mockInWeb) {
      this.webFallback = new WebBluetoothService();
    }
  }

  /**
   * 初始化蓝牙服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      if (this.webFallback) {
        await this.webFallback.initialize();
      } else {
        await BleClient.initialize();
      }
      
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('Bluetooth service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Bluetooth service:', error);
      throw error;
    }
  }
  
  /**
   * 检查蓝牙是否可用
   */
  public async isAvailable(): Promise<boolean> {
    try {
      if (this.webFallback) {
        return await this.webFallback.isAvailable();
      }
      
      if (!Capacitor.isNativePlatform()) {
        return false;
      }
      
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
      if (this.webFallback) {
        return await this.webFallback.requestPermissions();
      }
      
      await this.initialize();
      
      // 通过短暂扫描来请求权限
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
   * 添加扫描监听器
   */
  public addScanListener(listener: (device: BluetoothDevice) => void): void {
    this.scanListeners.push(listener);
  }
  
  /**
   * 移除扫描监听器
   */
  public removeScanListener(listener: (device: BluetoothDevice) => void): void {
    const index = this.scanListeners.indexOf(listener);
    if (index !== -1) {
      this.scanListeners.splice(index, 1);
    }
  }
  
  /**
   * 扫描蓝牙设备
   */
  public async scan(options: ScanOptions = {}): Promise<BluetoothDevice[]> {
    try {
      if (this.webFallback) {
        return await this.webFallback.scan(options);
      }
      
      await this.initialize();
      
      const devices: BluetoothDevice[] = [];
      
      // 设置扫描回调
      await BleClient.requestLEScan(
        {
          services: options.services || [],
          namePrefix: options.namePrefix,
          allowDuplicates: true
        },
        (result) => {
          const device = this.convertToBluetoothDevice(result);
          
          // 更新设备列表
          const existingIndex = devices.findIndex(d => d.deviceId === device.deviceId);
          if (existingIndex >= 0) {
            devices[existingIndex] = device;
          } else {
            devices.push(device);
          }
          
          // 通知监听器
          this.scanListeners.forEach(listener => listener(device));
        }
      );
      
      // 设置超时
      const timeoutMs = options.timeoutMs || 10000;
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
   * 停止扫描
   */
  public async stopScan(): Promise<void> {
    try {
      if (this.webFallback) {
        return await this.webFallback.stopScan();
      }
      
      await BleClient.stopLEScan();
    } catch (error) {
      console.error('Failed to stop Bluetooth scan:', error);
      throw error;
    }
  }
  
  /**
   * 连接到设备
   */
  public async connect(deviceId: string, options: ConnectOptions = {}): Promise<void> {
    try {
      if (this.webFallback) {
        return await this.webFallback.connect(deviceId, options);
      }
      
      await this.initialize();
      
      const timeout = options.timeout || 10000;
      await BleClient.connect(deviceId, timeout);
    } catch (error) {
      console.error(`Failed to connect to device ${deviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * 断开设备连接
   */
  public async disconnect(deviceId: string): Promise<void> {
    try {
      if (this.webFallback) {
        return await this.webFallback.disconnect(deviceId);
      }
      
      await BleClient.disconnect(deviceId);
    } catch (error) {
      console.error(`Failed to disconnect from device ${deviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * 获取设备服务
   */
  public async getServices(deviceId: string): Promise<string[]> {
    try {
      if (this.webFallback) {
        return await this.webFallback.getServices(deviceId);
      }
      
      const services = await BleClient.getServices(deviceId);
      return services.map(service => service.uuid);
    } catch (error) {
      console.error(`Failed to get services for device ${deviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * 获取服务特征
   */
  public async getCharacteristics(deviceId: string, serviceUuid: string): Promise<BluetoothCharacteristic[]> {
    try {
      if (this.webFallback) {
        return await this.webFallback.getCharacteristics(deviceId, serviceUuid);
      }
      
      const characteristics = await BleClient.getCharacteristics(deviceId, serviceUuid);
      
      return characteristics.map(char => ({
        uuid: char.uuid,
        properties: {
          read: char.properties.includes('read'),
          write: char.properties.includes('write'),
          notify: char.properties.includes('notify'),
          indicate: char.properties.includes('indicate')
        }
      }));
    } catch (error) {
      console.error(`Failed to get characteristics for device ${deviceId} and service ${serviceUuid}:`, error);
      throw error;
    }
  }
  
  /**
   * 读取特征值
   */
  public async readCharacteristic(deviceId: string, serviceUuid: string, characteristicUuid: string): Promise<string> {
    try {
      if (this.webFallback) {
        return await this.webFallback.readCharacteristic(deviceId, serviceUuid, characteristicUuid);
      }
      
      const value = await BleClient.readCharacteristic(deviceId, serviceUuid, characteristicUuid);
      return dataViewToText(value);
    } catch (error) {
      console.error(`Failed to read characteristic ${characteristicUuid}:`, error);
      throw error;
    }
  }
  
  /**
   * 写入特征值
   */
  public async writeCharacteristic(
    deviceId: string,
    serviceUuid: string,
    characteristicUuid: string,
    value: string
  ): Promise<void> {
    try {
      if (this.webFallback) {
        return await this.webFallback.writeCharacteristic(deviceId, serviceUuid, characteristicUuid, value);
      }
      
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      
      await BleClient.writeCharacteristic(
        deviceId,
        serviceUuid,
        characteristicUuid,
        data.buffer,
        'with-response'
      );
    } catch (error) {
      console.error(`Failed to write to characteristic ${characteristicUuid}:`, error);
      throw error;
    }
  }
  
  /**
   * 启动特征通知
   */
  public async startNotifications(
    deviceId: string,
    serviceUuid: string,
    characteristicUuid: string,
    callback: (value: string) => void
  ): Promise<void> {
    try {
      if (this.webFallback) {
        return await this.webFallback.startNotifications(deviceId, serviceUuid, characteristicUuid, callback);
      }
      
      await BleClient.startNotifications(
        deviceId,
        serviceUuid,
        characteristicUuid,
        (value) => {
          const textValue = dataViewToText(value);
          callback(textValue);
        }
      );
    } catch (error) {
      console.error(`Failed to start notifications for characteristic ${characteristicUuid}:`, error);
      throw error;
    }
  }
  
  /**
   * 停止特征通知
   */
  public async stopNotifications(
    deviceId: string,
    serviceUuid: string,
    characteristicUuid: string
  ): Promise<void> {
    try {
      if (this.webFallback) {
        return await this.webFallback.stopNotifications(deviceId, serviceUuid, characteristicUuid);
      }
      
      await BleClient.stopNotifications(deviceId, serviceUuid, characteristicUuid);
    } catch (error) {
      console.error(`Failed to stop notifications for characteristic ${characteristicUuid}:`, error);
      throw error;
    }
  }
  
  /**
   * 将Capacitor扫描结果转换为统一的设备对象
   */
  private convertToBluetoothDevice(result: ScanResult): BluetoothDevice {
    return {
      deviceId: result.device.deviceId,
      name: result.device.name || 'Unknown Device',
      rssi: result.rssi,
      manufacturerData: result.manufacturerData,
      serviceData: result.serviceData,
      serviceUUIDs: result.device.uuids || []
    };
  }
}