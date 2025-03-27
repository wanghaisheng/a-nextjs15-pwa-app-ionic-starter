/**
 * Bluetooth service for Capacitor BLE plugin
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { BluetoothService } from './bluetooth-service';
import { ServiceConfig } from '../types';

// Create a context for the Bluetooth service
const BluetoothServiceContext = createContext<BluetoothService | null>(null);

// Default configuration
const defaultConfig: ServiceConfig = {
  debug: false,
  mockInWeb: true
};

/**
 * Provider component for Bluetooth service
 */
export function BluetoothServiceProvider({
  children,
  config = defaultConfig
}: {
  children: React.ReactNode;
  config?: ServiceConfig;
}) {
  const [service] = useState(() => new BluetoothService(config));

  useEffect(() => {
    // Initialize the service when the provider is mounted
    service.initialize().catch(error => {
      console.error('Failed to initialize Bluetooth service', error);
    });

    // No cleanup needed as the service handles its own lifecycle
  }, [service]);

  return (
    <BluetoothServiceContext.Provider value={service}>
      {children}
    </BluetoothServiceContext.Provider>
  );
}

/**
 * Hook to use the Bluetooth service
 */
export function useBluetoothService(): BluetoothService {
  const service = useContext(BluetoothServiceContext);
  
  if (!service) {
    throw new Error('useBluetoothService must be used within a BluetoothServiceProvider');
  }
  
  return service;
}

// Export the service class and types
export { BluetoothService } from './bluetooth-service';
export * from './types';