/**
 * 蓝牙服务类型定义
 * 提供统一的蓝牙设备和服务接口
 */

/**
 * 蓝牙设备信息
 */
export interface BluetoothDevice {
  deviceId: string;
  name?: string;
  rssi?: number;
  manufacturerData?: Map<number, DataView>;
  serviceData?: Map<string, DataView>;
  serviceUUIDs?: string[];
  localName?: string;
  txPower?: number;
  isConnectable?: boolean;
}

/**
 * 蓝牙扫描选项
 */
export interface ScanOptions {
  /**
   * 服务UUID过滤列表
   */
  services?: string[];
  
  /**
   * 设备名称前缀过滤
   */
  namePrefix?: string;
  
  /**
   * 是否允许重复结果
   */
  allowDuplicates?: boolean;
  
  /**
   * 扫描超时时间(毫秒)
   */
  timeoutMs?: number;
}

/**
 * 蓝牙连接选项
 */
export interface ConnectionOptions {
  /**
   * 连接超时时间(毫秒)
   */
  timeoutMs?: number;
}

/**
 * 蓝牙服务接口
 */
export interface BluetoothService {
  /**
   * 初始化蓝牙服务
   */
  initialize(): Promise<void>;
  
  /**
   * 检查蓝牙是否可用
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * 请求蓝牙权限
   */
  requestPermissions(): Promise<boolean>;
  
  /**
   * 扫描蓝牙设备
   */
  scan(options?: ScanOptions): Promise<BluetoothDevice[]>;
  
  /**
   * 连接到蓝牙设备
   */
  connect(deviceId: string, options?: ConnectionOptions): Promise<void>;
  
  /**
   * 断开蓝牙设备连接
   */
  disconnect(deviceId: string): Promise<void>;
  
  /**
   * 读取特征值
   */
  read(deviceId: string, service: string, characteristic: string): Promise<DataView>;
  
  /**
   * 写入特征值
   */
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    data: DataView | string,
    writeWithResponse?: boolean
  ): Promise<void>;
  
  /**
   * 启动特征值通知
   */
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (data: DataView) => void
  ): Promise<void>;
  
  /**
   * 停止特征值通知
   */
  stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string
  ): Promise<void>;
  
  /**
   * 添加扫描监听器
   */
  addScanListener(listener: (device: BluetoothDevice) => void): void;
  
  /**
   * 移除扫描监听器
   */
  removeScanListener(listener: (device: BluetoothDevice) => void): void;
}

/**
 * 蓝牙服务信息
 */
export interface BluetoothServiceInfo {
  uuid: string;
  characteristics: BluetoothCharacteristic[];
}

/**
 * 蓝牙特征信息
 */
export interface BluetoothCharacteristic {
  uuid: string;
  properties: CharacteristicProperties;
  descriptors?: BluetoothDescriptor[];
}

/**
 * 蓝牙描述符信息
 */
export interface BluetoothDescriptor {
  uuid: string;
}

/**
 * 特征属性
 */
export interface CharacteristicProperties {
  broadcast: boolean;
  read: boolean;
  writeWithoutResponse: boolean;
  write: boolean;
  notify: boolean;
  indicate: boolean;
  authenticatedSignedWrites: boolean;
  reliableWrite: boolean;
  writableAuxiliaries: boolean;
}

/**
 * 特征值数据结果
 */
export interface DataResult {
  value: DataView;
  characteristic: BluetoothCharacteristic;
}

/**
 * 蓝牙错误代码
 */
export enum BluetoothErrorCode {
  INITIALIZATION_ERROR = 'bluetooth_initialization_error',
  SCAN_ERROR = 'bluetooth_scan_error',
  CONNECT_ERROR = 'bluetooth_connect_error',
  DISCONNECT_ERROR = 'bluetooth_disconnect_error',
  SERVICE_ERROR = 'bluetooth_service_error',
  CHARACTERISTIC_ERROR = 'bluetooth_characteristic_error',
  READ_ERROR = 'bluetooth_read_error',
  WRITE_ERROR = 'bluetooth_write_error',
  NOTIFY_ERROR = 'bluetooth_notify_error',
  NOT_SUPPORTED = 'bluetooth_not_supported',
  PERMISSION_DENIED = 'bluetooth_permission_denied',
  DEVICE_NOT_FOUND = 'bluetooth_device_not_found',
  TIMEOUT = 'bluetooth_timeout',
  UNKNOWN_ERROR = 'bluetooth_unknown_error'
}