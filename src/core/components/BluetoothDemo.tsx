/**
 * 蓝牙功能演示组件
 * 展示如何使用蓝牙服务进行设备扫描、连接和数据交互
 */
'use client';

import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonButton, IonList, IonItem, IonLabel, IonSpinner, IonIcon, IonBadge } from '@ionic/react';
import { bluetoothOutline, scanOutline, linkOutline, closeCircleOutline, informationCircleOutline } from 'ionicons/icons';
import { useBluetoothService, BluetoothDevice } from '@/core/services/bluetooth';
import { useI18n } from '@/core/lib/i18n/config';

export default function BluetoothDemo() {
  const t = useI18n();
  const bluetoothService = useBluetoothService();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 检查蓝牙是否可用
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await bluetoothService.isAvailable();
        setIsAvailable(available);
        setStatusMessage(available ? t('bluetooth.available') : t('bluetooth.not_available'));
      } catch (error) {
        setError(t('bluetooth.error.check_availability'));
        console.error('Error checking Bluetooth availability:', error);
      }
    };

    checkAvailability();
  }, [bluetoothService, t]);

  // 请求权限
  const requestPermissions = async () => {
    try {
      setStatusMessage(t('bluetooth.requesting_permissions'));
      const granted = await bluetoothService.requestPermissions();
      setStatusMessage(granted ? t('bluetooth.permissions_granted') : t('bluetooth.permissions_denied'));
      return granted;
    } catch (error) {
      setError(t('bluetooth.error.request_permissions'));
      console.error('Error requesting Bluetooth permissions:', error);
      return false;
    }
  };

  // 开始扫描设备
  const startScan = async () => {
    try {
      // 请求权限
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        setStatusMessage(t('bluetooth.cannot_scan_without_permissions'));
        return;
      }

      setIsScanning(true);
      setStatusMessage(t('bluetooth.scanning'));
      setDevices([]);
      setError('');

      // 添加扫描监听器
      bluetoothService.addScanListener((device) => {
        setDevices((prevDevices) => {
          // 检查设备是否已存在
          const exists = prevDevices.some(d => d.deviceId === device.deviceId);
          if (exists) {
            // 更新现有设备
            return prevDevices.map(d => d.deviceId === device.deviceId ? device : d);
          } else {
            // 添加新设备
            return [...prevDevices, device];
          }
        });
      });

      // 开始扫描，10秒超时
      const foundDevices = await bluetoothService.scan({ timeoutMs: 10000 });
      
      setIsScanning(false);
      setStatusMessage(t('bluetooth.scan_complete', { count: foundDevices.length }));
    } catch (error) {
      setIsScanning(false);
      setError(t('bluetooth.error.scan_failed'));
      setStatusMessage(t('bluetooth.scan_failed'));
      console.error('Error scanning for devices:', error);
    }
  };

  // 停止扫描
  const stopScan = async () => {
    setIsScanning(false);
    setStatusMessage(t('bluetooth.scan_stopped'));
  };

  // 连接到设备
  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      setStatusMessage(t('bluetooth.connecting', { name: device.name || device.deviceId }));
      setSelectedDevice(device);
      setError('');

      await bluetoothService.connect(device.deviceId);
      
      setIsConnected(true);
      setStatusMessage(t('bluetooth.connected', { name: device.name || device.deviceId }));
    } catch (error) {
      setError(t('bluetooth.error.connect_failed'));
      setStatusMessage(t('bluetooth.connect_failed'));
      console.error('Error connecting to device:', error);
    }
  };

  // 断开连接
  const disconnectFromDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      setStatusMessage(t('bluetooth.disconnecting', { name: selectedDevice.name || selectedDevice.deviceId }));
      
      await bluetoothService.disconnect(selectedDevice.deviceId);
      
      setIsConnected(false);
      setStatusMessage(t('bluetooth.disconnected', { name: selectedDevice.name || selectedDevice.deviceId }));
    } catch (error) {
      setError(t('bluetooth.error.disconnect_failed'));
      console.error('Error disconnecting from device:', error);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {/* 状态信息 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <IonIcon icon={bluetoothOutline} className="text-blue-500 mr-2" />
            <h2 className="text-xl font-bold">{t('bluetooth.title')}</h2>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm">
              <span className="font-medium">{t('bluetooth.status')}:</span> {statusMessage}
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1">
                <span className="font-medium">{t('bluetooth.error.title')}:</span> {error}
              </p>
            )}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <IonButton 
            onClick={startScan} 
            disabled={isScanning || !isAvailable}
            color="primary"
          >
            <IonIcon slot="start" icon={scanOutline} />
            {t('bluetooth.start_scan')}
          </IonButton>
          
          {isScanning && (
            <IonButton 
              onClick={stopScan} 
              color="medium"
            >
              <IonIcon slot="start" icon={closeCircleOutline} />
              {t('bluetooth.stop_scan')}
            </IonButton>
          )}
          
          {isConnected && selectedDevice && (
            <IonButton 
              onClick={disconnectFromDevice} 
              color="danger"
            >
              <IonIcon slot="start" icon={closeCircleOutline} />
              {t('bluetooth.disconnect')}
            </IonButton>
          )}
        </div>

        {/* 设备列