# Bluetooth Service

## Overview

The Bluetooth service provides a unified API for interacting with Bluetooth Low Energy (BLE) devices across different platforms. It uses the `@capacitor-community/bluetooth-le` plugin for native functionality and provides web fallbacks when running as a PWA.

## Features

- Device scanning with filtering options
- Device connection management
- Reading and writing to characteristics
- Notifications for characteristic value changes
- Comprehensive error handling
- Platform detection and appropriate implementations

## Usage

### Setup

First, wrap your application or component with the `BluetoothServiceProvider`:

```tsx
import { BluetoothServiceProvider } from '@/app/services/bluetooth';

function App() {
  return (
    <BluetoothServiceProvider>
      <YourComponent />
    </BluetoothServiceProvider>
  );
}
```

### Using the Service

Use the `useBluetoothService` hook to access the Bluetooth functionality:

```tsx
import { useBluetoothService } from '@/app/services/bluetooth';
import { useState } from 'react';

function YourComponent() {
  const bluetoothService = useBluetoothService();
  const [devices, setDevices] = useState([]);
  
  const scanForDevices = async () => {
    try {
      // Check if Bluetooth is available
      const available = await bluetoothService.isAvailable();
      if (!available) {
        console.log('Bluetooth is not available');
        return;
      }
      
      // Request permissions
      const permissionsGranted = await bluetoothService.requestPermissions();
      if (!permissionsGranted) {
        console.log('Bluetooth permissions denied');
        return;
      }
      
      // Scan for devices
      const foundDevices = await bluetoothService.scan({
        services: ['heart_rate'], // Optional: filter by service UUIDs
        timeoutMs: 5000 // Scan for 5 seconds
      });
      
      setDevices(foundDevices);
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  };
  
  return (
    <div>
      <button onClick={scanForDevices}>Scan for Devices</button>
      <ul>
        {devices.map(device => (
          <li key={device.deviceId}>{device.name || 'Unknown Device'}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Connecting to a Device

```tsx
const connectToDevice = async (deviceId) => {
  try {
    await bluetoothService.connect(deviceId);
    console.log('Connected to device');
  } catch (error) {
    console.error('Error connecting to device:', error);
  }
};
```

### Reading and Writing Data

```tsx
// Reading data
const readData = async (deviceId, serviceUuid, characteristicUuid) => {
  try {
    const data = await bluetoothService.read(deviceId, serviceUuid, characteristicUuid);
    console.log('Read data:', data);
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

// Writing data
const writeData = async (deviceId, serviceUuid, characteristicUuid, data) => {
  try {
    await bluetoothService.write(deviceId, serviceUuid, characteristicUuid, data);
    console.log('Data written successfully');
  } catch (error) {
    console.error('Error writing data:', error);
  }
};
```

### Notifications

```tsx
const startNotifications = async (deviceId, serviceUuid, characteristicUuid) => {
  try {
    await bluetoothService.startNotifications(
      deviceId,
      serviceUuid,
      characteristicUuid,
      (data) => {
        console.log('Notification received:', data);
      }
    );
    console.log('Notifications started');
  } catch (error) {
    console.error('Error starting notifications:', error);
  }
};
```

## Error Handling

The service provides standardized error codes and messages. You can catch and handle errors as shown in the examples above.

## Platform Considerations

- **iOS**: Bluetooth permissions are requested automatically when needed
- **Android**: Location permissions may be required for scanning
- **Web**: Limited functionality based on browser support for Web Bluetooth API

## Configuration

You can configure the service by passing options to the provider:

```tsx
<BluetoothServiceProvider 
  config={{
    debug: true, // Enable debug logging
    mockInWeb: true // Enable mock functionality in web environment
  }}
>
  <YourComponent />
</BluetoothServiceProvider>
```