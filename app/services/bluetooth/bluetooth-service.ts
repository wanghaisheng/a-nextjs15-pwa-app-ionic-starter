/**
 * Bluetooth service implementation for Capacitor BLE plugin
 */
import { Capacitor } from '@capacitor/core';
import { BleClient, BleDevice, ScanResult, dataViewToText, numberToUUID, textToDataView } from '@capacitor-community/bluetooth-le';
import { CapacitorBaseService } from '../base-service';
import { BluetoothDevice, BluetoothErrorCode, BluetoothService as IBluetoothService, ScanOptions, ConnectionOptions, BluetoothCharacteristic, DataResult } from './types';
import { ServiceConfig, ServiceError } from '../types';

/**
 * Implementation of the Bluetooth service using Capacitor BLE plugin
 */
export class BluetoothService extends CapacitorBaseService implements IBluetoothService {
  private initialized = false;
  private connectedDevices: Map<string, BleDevice> = new Map();
  private scanListeners: Set<(device: BluetoothDevice) => void> = new Set();
  
  constructor(config?: ServiceConfig) {
    super(config);
  }
  
  /**
   * Initialize the Bluetooth service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      if (await this.isAvailable()) {
        await BleClient.initialize({ androidNeverForLocation: false });
        this.initialized = true;
        this.log('Bluetooth service initialized');
      } else {
        throw this.createError(
          BluetoothErrorCode.NOT_SUPPORTED,
          'Bluetooth is not available on this platform'
        );
      }
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.INITIALIZATION_ERROR,
        'Failed to initialize Bluetooth service',
        error
      );
      this.log('Initialization error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Check if Bluetooth is available and enabled
   */
  public async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return this.mockInWeb;
    }
    
    try {
      return await BleClient.isEnabled();
    } catch (error) {
      this.log('Error checking Bluetooth availability', error);
      return false;
    }
  }
  
  /**
   * Request Bluetooth permissions
   */
  public async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return this.mockInWeb;
    }
    
    try {
      const result = await BleClient.requestLEScan(
        { services: [] },
        () => {}
      );
      await BleClient.stopLEScan();
      return true;
    } catch (error) {
      this.log('Error requesting Bluetooth permissions', error);
      return false;
    }
  }
  
  /**
   * Scan for Bluetooth devices
   */
  public async scan(options?: ScanOptions): Promise<BluetoothDevice[]> {
    await this.ensureInitialized();
    
    const devices: BluetoothDevice[] = [];
    const deviceMap = new Map<string, BluetoothDevice>();
    
    try {
      await BleClient.requestLEScan(
        {
          services: options?.services || [],
          namePrefix: options?.name,
          allowDuplicates: options?.allowDuplicates || false,
        },
        (result) => {
          const device = this.mapScanResultToDevice(result);
          deviceMap.set(device.deviceId, device);
          devices.push(device);
          
          // Notify any listeners
          this.scanListeners.forEach(listener => listener(device));
        }
      );
      
      // Set timeout to stop scanning
      const timeoutMs = options?.timeoutMs || 5000;
      setTimeout(async () => {
        try {
          await BleClient.stopLEScan();
          this.log('Scan stopped after timeout', { timeoutMs });
        } catch (error) {
          this.log('Error stopping scan', error);
        }
      }, timeoutMs);
      
      return Array.from(deviceMap.values());
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.SCAN_ERROR,
        'Failed to scan for Bluetooth devices',
        error
      );
      this.log('Scan error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Connect to a Bluetooth device
   */
  public async connect(deviceId: string, options?: ConnectionOptions): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await BleClient.connect(
        deviceId,
        (deviceId) => this.handleDisconnect(deviceId),
        options?.timeoutMs
      );
      
      // Store the connected device
      this.connectedDevices.set(deviceId, { deviceId });
      this.log('Connected to device', { deviceId });
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.CONNECT_ERROR,
        `Failed to connect to device: ${deviceId}`,
        error
      );
      this.log('Connection error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Disconnect from a Bluetooth device
   */
  public async disconnect(deviceId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.connectedDevices.has(deviceId)) {
      this.log('Device not connected', { deviceId });
      return;
    }
    
    try {
      await BleClient.disconnect(deviceId);
      this.connectedDevices.delete(deviceId);
      this.log('Disconnected from device', { deviceId });
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.DISCONNECT_ERROR,
        `Failed to disconnect from device: ${deviceId}`,
        error
      );
      this.log('Disconnection error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Read data from a characteristic
   */
  public async read(deviceId: string, service: string, characteristic: string): Promise<DataView> {
    await this.ensureInitialized();
    
    try {
      const data = await BleClient.read(deviceId, service, characteristic);
      this.log('Read data from characteristic', {
        deviceId,
        service,
        characteristic,
        dataLength: data.byteLength
      });
      return data;
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.READ_ERROR,
        `Failed to read from characteristic: ${characteristic}`,
        error
      );
      this.log('Read error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Write data to a characteristic
   */
  public async write(
    deviceId: string,
    service: string,
    characteristic: string,
    data: DataView | string,
    writeWithResponse = true
  ): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const dataView = typeof data === 'string' ? textToDataView(data) : data;
      
      await BleClient.write(
        deviceId,
        service,
        characteristic,
        dataView,
        writeWithResponse
      );
      
      this.log('Wrote data to characteristic', {
        deviceId,
        service,
        characteristic,
        dataLength: dataView.byteLength,
        writeWithResponse
      });
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.WRITE_ERROR,
        `Failed to write to characteristic: ${characteristic}`,
        error
      );
      this.log('Write error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Start notifications for a characteristic
   */
  public async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (data: DataView) => void
  ): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await BleClient.startNotifications(
        deviceId,
        service,
        characteristic,
        (data) => {
          this.log('Received notification', {
            deviceId,
            service,
            characteristic,
            dataLength: data.byteLength
          });
          callback(data);
        }
      );
      
      this.log('Started notifications for characteristic', {
        deviceId,
        service,
        characteristic
      });
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.NOTIFY_ERROR,
        `Failed to start notifications for characteristic: ${characteristic}`,
        error
      );
      this.log('Notification error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Stop notifications for a characteristic
   */
  public async stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string
  ): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await BleClient.stopNotifications(deviceId, service, characteristic);
      
      this.log('Stopped notifications for characteristic', {
        deviceId,
        service,
        characteristic
      });
    } catch (error) {
      const serviceError = this.createError(
        BluetoothErrorCode.NOTIFY_ERROR,
        `Failed to stop notifications for characteristic: ${characteristic}`,
        error
      );
      this.log('Notification error', serviceError);
      throw serviceError;
    }
  }
  
  /**
   * Add a listener for scan results
   */
  public addScanListener(listener: (device: BluetoothDevice) => void): void {
    this.scanListeners.add(listener);
  }
  
  /**
   * Remove a listener for scan results
   */
  public removeScanListener(listener: (device: BluetoothDevice) => void): void {
    this.scanListeners.delete(listener);
  }
  
  /**
   * Handle device disconnection
   */
  private handleDisconnect(deviceId: string): void {
    this.connectedDevices.delete(deviceId);
    this.log('Device disconnected', { deviceId });
  }
  
  /**
   * Map a scan result to a device object
   */
  private mapScanResultToDevice(result: ScanResult): BluetoothDevice {
    return {
      deviceId: result.device.deviceId,
      name: result.device.name || result.localName || 'Unknown Device',
      rssi: result.rssi,
      localName: result.localName,
      txPower: result.txPower,
      isConnectable: result.isConnectable,
      manufacturerData: result.manufacturerData,
      serviceData: result.serviceData,
      serviceUUIDs: result.serviceUUIDs
    };
  }
  
  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}