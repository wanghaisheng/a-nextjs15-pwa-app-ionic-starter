/**
 * Type definitions for Bluetooth service
 */

/**
 * Bluetooth device information
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
 * Scan options for Bluetooth devices
 */
export interface ScanOptions {
  /**
   * List of service UUIDs to filter by
   */
  services?: string[];
  
  /**
   * Name to filter by
   */
  name?: string;
  
  /**
   * Whether to allow duplicates in scan results
   */
  allowDuplicates?: boolean;
  
  /**
   * Scan timeout in milliseconds
   */
  timeoutMs?: number;
}

/**
 * Connection options for Bluetooth devices
 */
export interface ConnectionOptions {
  /**
   * Timeout for connection in milliseconds
   */
  timeoutMs?: number;
}

/**
 * Bluetooth service interface
 */
export interface BluetoothService {
  /**
   * Initialize the Bluetooth service
   */
  initialize(): Promise<void>;
  
  /**
   * Check if Bluetooth is available and enabled
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Request Bluetooth permissions
   */
  requestPermissions(): Promise<boolean>;
  
  /**
   * Scan for Bluetooth devices
   */
  scan(options?: ScanOptions): Promise<BluetoothDevice[]>;
  
  /**
   * Connect to a Bluetooth device
   */
  connect(deviceId: string, options?: ConnectionOptions): Promise<void>;
  
  /**
   * Disconnect from a Bluetooth device
   */
  disconnect(deviceId: string): Promise<void>;
  
  /**
   * Read data from a characteristic
   */
  read(deviceId: string, service: string, characteristic: string): Promise<DataView>;
  
  /**
   * Write data to a characteristic
   */
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    data: DataView | string,
    writeWithResponse?: boolean
  ): Promise<void>;
  
  /**
   * Start notifications for a characteristic
   */
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (data: DataView) => void
  ): Promise<void>;
  
  /**
   * Stop notifications for a characteristic
   */
  stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string
  ): Promise<void>;
  
  /**
   * Add a listener for scan results
   */
  addScanListener(listener: (device: BluetoothDevice) => void): void;
  
  /**
   * Remove a listener for scan results
   */
  removeScanListener(listener: (device: BluetoothDevice) => void): void;
}

/**
 * Bluetooth service information
 */
export interface BluetoothServiceInfo {
  uuid: string;
  characteristics: BluetoothCharacteristic[];
}

/**
 * Characteristic information
 */
export interface BluetoothCharacteristic {
  uuid: string;
  properties: CharacteristicProperties;
  descriptors?: BluetoothDescriptor[];
}

/**
 * Descriptor information
 */
export interface BluetoothDescriptor {
  uuid: string;
}

/**
 * Characteristic properties
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
 * Data received from a characteristic
 */
export interface DataResult {
  value: DataView;
  characteristic: BluetoothCharacteristic;
}

/**
 * Error codes for Bluetooth operations
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