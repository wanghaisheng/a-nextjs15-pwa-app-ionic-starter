# Capacitor Plugin Services

This directory contains service wrappers for Capacitor plugins used in the application. These services provide a unified API layer for accessing native device functionality with web fallbacks when running as a PWA.

## Architecture

Each plugin has its own service wrapper that follows these principles:

1. **Platform Detection** - Services detect whether they're running in a native environment or web environment and provide appropriate implementations
2. **Consistent API** - All services expose a consistent, type-safe API regardless of platform
3. **Error Handling** - Standardized error handling and logging across all plugins
4. **Lazy Loading** - Plugins are loaded only when needed to optimize bundle size

## Available Services

- **BluetoothService** - Bluetooth Low Energy functionality
- **DatabaseService** - SQLite database operations
- **FileService** - File system operations using Capawesome plugins
- **BackgroundTaskService** - Background task management
- **PurchasesService** - In-app purchases via RevenueCat
- **AuthService** - Social login providers (OAuth2, WeChat, Alipay)
- **PhoneAuthService** - Phone verification code authentication

## Usage

All services are available through the `useService` hook:

```typescript
import { useBluetoothService } from '@/app/services/bluetooth';

function MyComponent() {
  const bluetoothService = useBluetoothService();
  
  const scanForDevices = async () => {
    try {
      const devices = await bluetoothService.scan();
      // Handle devices
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <button onClick={scanForDevices}>Scan for Devices</button>
  );
}
```

## Error Handling

All services use a standardized error format:

```typescript
export interface ServiceError {
  code: string;
  message: string;
  native?: any; // Original native error if available
}
```

## Web Fallbacks

When running in a web environment without native capabilities, services provide appropriate fallbacks:

- Mock data where appropriate
- IndexedDB for database operations
- LocalStorage for simple persistence
- Clear error messages indicating native-only functionality