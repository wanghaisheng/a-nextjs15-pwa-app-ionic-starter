/**
 * Web端蓝牙服务模拟实现
 * 提供与原生插件相同的API接口，但使用Web Bluetooth API
 */

import { BluetoothDevice } from './types';

/**
 * Web蓝牙服务类
 * 使用Web Bluetooth API实现蓝牙功能
 */
class WebBluetoothService {
  private scanListeners: Set<(device: BluetoothDevice) => void> = new Set();
  private connectedDevices: Map<string, BluetoothDevice> = new Map();
  
  /**
   * 初始化蓝牙服务
   */
  public async initialize(): Promise<void> {
    // Web端无需特殊初始化
    return Promise.resolve();
  }
  
  /**
   * 检查蓝牙是否可用
   */
  public async isAvailable(): Promise<boolean> {
    return typeof navigator !== 'undefined' && 
           typeof navigator.bluetooth !== 'undefined';
  }
  
  /**
   * 请求蓝牙权限
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (!await this.isAvailable()) {
        return false;
      }
      
      // 在Web中，尝试请求设备会触发权限请求
      await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      
      return true;
    } catch (error) {
      // 用户取消了请求或发生错误
      console.warn('Web Bluetooth permission request failed:', error);
      return false;
    }
  }
  
  /**
   * 扫描蓝牙设备
   */
  public async scan(options: any = {}): Promise<BluetoothDevice[]> {
    try {
      if (!await this.isAvailable()) {
        throw new Error('Web Bluetooth is not available');
      }
      
      const filters: any[] = [];
      
      // 添加服务过滤器
      if (options.services && options.services.length > 0) {
        filters.push({ services: options.services });
      }
      
      // 添加名称前缀过滤器
      if (options.namePrefix) {
        filters.push({ namePrefix: options.namePrefix });
      }
      
      // 如果没有过滤器，接受所有设备
      const requestOptions = filters.length > 0 
        ? { filters } 
        : { acceptAllDevices: true };
      
      // 请求设备
      const device = await navigator.bluetooth.requestDevice(requestOptions);
      
      // 转换为通用格式
      const bleDevice: BluetoothDevice = {
        deviceId: device.id,
        name: device.name || 'Unknown Device',
        isConnectable: true
      };
      
      // 通知监听器
      this.scanListeners.forEach(listener => listener(bleDevice));
      
      return [bleDevice];
    } catch (error) {
      console.error('Web Bluetooth scan error:', error);
      return [];
    }
  }
  
  /**
   * 连接到蓝牙设备
   */
  public async connect(deviceId: string): Promise<void> {
    try {
      // 在Web Bluetooth中，连接是在与设备交互时自动建立的
      // 这里我们只记录连接状态
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [] }]
      });
      
      if (device.id === deviceId) {
        const bleDevice: BluetoothDevice = {
          deviceId: device.id,
          name: device.name || 'Unknown Device',
          isConnectable: true
        };
        
        this.connectedDevices.set(deviceId, bleDevice);
      } else {
        throw new Error('Device ID mismatch');
      }
    } catch (error) {
      console.error(`Web Bluetooth connect error for device ${deviceId}:`, error);
      throw error;
    }
  }
  
  /**
   * 断开蓝牙设备连接
   */
  public async disconnect(deviceId: string): Promise<void> {
    // 在Web Bluetooth中，连接会自动管理
    // 这里我们只清除连接状态
    this.connectedDevices.delete(deviceId);
    return Promise.resolve();
  }
  
  /**
   * 读取特征值
   */
  public async read(deviceId: string, service: string, characteristic: string): Promise<DataView> {
    try {
      // Web Bluetooth API实现
      const device = await this.getWebBluetoothDevice(deviceId);
      const gatt = await device.gatt?.connect();
      
      if (!gatt) throw new Error('GATT server not available');
      
      const serviceObj = await gatt.getPrimaryService(service);
      const characteristicObj = await serviceObj.getCharacteristic(characteristic);
      return await characteristicObj.readValue();
    } catch (error) {
      console.error(`Web Bluetooth read error for ${deviceId}/${service}/${characteristic}:`, error);
      throw error;
    }
  }
  
  /**
   * 写入特征值
   */
  public async write(deviceId: string, service: string, characteristic: string, value: DataView): Promise<void> {
    try {
      // Web Bluetooth API实现
      const device = await this.getWebBluetoothDevice(deviceId);
      const gatt = await device.gatt?.connect();
      
      if (!gatt) throw new Error('GATT server not available');
      
      const serviceObj = await gatt.getPrimaryService(service);
      const characteristicObj = await serviceObj.getCharacteristic(characteristic);
      await characteristicObj.writeValue(value);
    } catch (error) {
      console.error(`Web Bluetooth write error for ${deviceId}/${service}/${characteristic}:`, error);
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
      // Web Bluetooth API实现
      const device = await this.getWebBluetoothDevice(deviceId);
      const gatt = await device.gatt?.connect();
      
      if (!gatt) throw new Error('GATT server not available');
      
      const serviceObj = await gatt.getPrimaryService(service);
      const characteristicObj = await serviceObj.getCharacteristic(characteristic);
      
      await characteristicObj.startNotifications();
      characteristicObj.addEventListener('characteristicvaluechanged', (event: any) => {
        callback(event.target.value);
      });
    } catch (error) {
      console.error(`Web Bluetooth notification error for ${deviceId}/${service}/${characteristic}:`, error);
      throw error;
    }
  }
  
  /**
   * 停止特征值通知
   */
  public async stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void> {
    try {
      // Web Bluetooth API实现
      const device = await this.getWebBluetoothDevice(deviceId);
      const gatt = await device.gatt?.connect();
      
      if (!gatt) throw new Error('GATT server not available');
      
      const serviceObj = await gatt.getPrimaryService(service);
      const characteristicObj = await serviceObj.getCharacteristic(characteristic);
      
      await characteristicObj.stopNotifications();
    } catch (error) {
      console.error(`Web Bluetooth stop notification error for ${deviceId}/${service}/${characteristic}:`, error);
      throw error;
    }
  }
  
  /**
   * 添加扫描监听器
   */
  public addScanListener(listener: (device: BluetoothDevice) => void): void {
    this.scanListeners.add(listener);
  }
  
  /**
   * 移除扫描监听器
   */
  public removeScanListener(listener: (device: BluetoothDevice) => void): void {
    this.scanListeners.delete(listener);
  }
  
  /**
   * 获取Web Bluetooth设备
   */
  private async getWebBluetoothDevice(deviceId: string): Promise<any> {
    try {
      // 尝试通过ID获取设备
      // 注意：Web Bluetooth API目前不支持通过ID直接获取设备
      // 这里是一个模拟实现
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [] }]
      });
      
      if (device.id !== deviceId) {
        throw new Error('Device ID mismatch');
      }
      
      return device;
    } catch (error) {
      console.error(`Failed to get Web Bluetooth device ${deviceId}:`, error);
      throw error;
    }
  }
}

// 导出单例实例
export const webBluetoothService = new WebBluetoothService();