/**
 * Bluetooth Demo Component
 * 
 * This component demonstrates how to use the Bluetooth service in a React component.
 * It provides UI for scanning, connecting, and interacting with Bluetooth devices.
 */
'use client';

import { useState, useEffect } from 'react';
import { useBluetoothService } from '../services/bluetooth';
import { BluetoothDevice } from '../services/bluetooth/types';

export default function BluetoothDemo() {
  const bluetoothService = useBluetoothService();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Check if Bluetooth is available when component mounts
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await bluetoothService.isAvailable();
        setIsAvailable(available);
        setStatusMessage(available ? 'Bluetooth is available' : 'Bluetooth is not available');
      } catch (error) {
        setError('Failed to check Bluetooth availability');
        console.error('Error checking Bluetooth availability:', error);
      }
    };

    checkAvailability();
  }, [bluetoothService]);

  // Request permissions
  const requestPermissions = async () => {
    try {
      setStatusMessage('Requesting Bluetooth permissions...');
      const granted = await bluetoothService.requestPermissions();
      setStatusMessage(granted ? 'Permissions granted' : 'Permissions denied');
      return granted;
    } catch (error) {
      setError('Failed to request Bluetooth permissions');
      console.error('Error requesting Bluetooth permissions:', error);
      return false;
    }
  };

  // Start scanning for devices
  const startScan = async () => {
    try {
      // Request permissions first
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        setStatusMessage('Cannot scan without permissions');
        return;
      }

      setIsScanning(true);
      setStatusMessage('Scanning for devices...');
      setDevices([]);
      setError('');

      // Add scan listener to update devices in real-time
      bluetoothService.addScanListener((device) => {
        setDevices((prevDevices) => {
          // Check if device already exists
          const exists = prevDevices.some(d => d.deviceId === device.deviceId);
          if (exists) {
            // Update existing device
            return prevDevices.map(d => d.deviceId === device.deviceId ? device : d);
          } else {
            // Add new device
            return [...prevDevices, device];
          }
        });
      });

      // Start scan with 10 second timeout
      const foundDevices = await bluetoothService.scan({ timeoutMs: 10000 });
      
      setIsScanning(false);
      setStatusMessage(`Scan complete. Found ${foundDevices.length} devices.`);
    } catch (error) {
      setIsScanning(false);
      setError('Failed to scan for devices');
      setStatusMessage('Scan failed');
      console.error('Error scanning for devices:', error);
    }
  };

  // Stop scanning
  const stopScan = async () => {
    setIsScanning(false);
    setStatusMessage('Scan stopped');
  };

  // Connect to a device
  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      setStatusMessage(`Connecting to ${device.name || 'device'}...`);
      setError('');
      
      await bluetoothService.connect(device.deviceId);
      
      setSelectedDevice(device);
      setIsConnected(true);
      setStatusMessage(`Connected to ${device.name || 'device'}`);
    } catch (error) {
      setError(`Failed to connect to ${device.name || 'device'}`);
      setStatusMessage('Connection failed');
      console.error('Error connecting to device:', error);
    }
  };

  // Disconnect from a device
  const disconnectFromDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      setStatusMessage(`Disconnecting from ${selectedDevice.name || 'device'}...`);
      
      await bluetoothService.disconnect(selectedDevice.deviceId);
      
      setIsConnected(false);
      setStatusMessage(`Disconnected from ${selectedDevice.name || 'device'}`);
    } catch (error) {
      setError(`Failed to disconnect from ${selectedDevice.name || 'device'}`);
      console.error('Error disconnecting from device:', error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Bluetooth Demo</h2>
      
      {/* Status and Error Messages */}
      {statusMessage && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
          {statusMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {/* Availability */}
      <div className="mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Bluetooth {isAvailable ? 'Available' : 'Not Available'}</span>
        </div>
      </div>
      
      {/* Scan Controls */}
      <div className="mb-4">
        <button
          onClick={isScanning ? stopScan : startScan}
          disabled={!isAvailable}
          className={`px-4 py-2 rounded ${isScanning ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isScanning ? 'Stop Scan' : 'Scan for Devices'}
        </button>
      </div>
      
      {/* Device List */}
      {devices.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Devices</h3>
          <ul className="border rounded divide-y">
            {devices.map((device) => (
              <li key={device.deviceId} className="p-2 hover:bg-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{device.name || 'Unknown Device'}</div>
                    <div className="text-xs text-gray-500">{device.deviceId}</div>
                    {device.rssi && <div className="text-xs">Signal: {device.rssi} dBm</div>}
                  </div>
                  <button
                    onClick={() => connectToDevice(device)}
                    disabled={isConnected}
                    className={`px-2 py-1 text-sm rounded bg-green-500 text-white ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Connect
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Connected Device */}
      {isConnected && selectedDevice && (
        <div className="mb-4 p-3 border rounded bg-green-50">
          <h3 className="text-lg font-semibold mb-2">Connected Device</h3>
          <div className="mb-2">
            <div className="font-medium">{selectedDevice.name || 'Unknown Device'}</div>
            <div className="text-xs text-gray-500">{selectedDevice.deviceId}</div>
          </div>
          <button
            onClick={disconnectFromDevice}
            className="px-2 py-1 text-sm rounded bg-red-500 text-white"
          >
            Disconnect
          </button>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Note: This demo requires a device with Bluetooth capabilities and appropriate permissions.</p>
        <p>When running as a PWA, some features may be limited based on browser support.</p>
      </div>
    </div>
  );
}