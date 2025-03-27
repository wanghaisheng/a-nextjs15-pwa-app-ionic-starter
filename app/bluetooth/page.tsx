/**
 * Bluetooth Demo Page
 * 
 * This page demonstrates the Bluetooth functionality using the BluetoothDemo component.
 */
'use client';

import { BluetoothServiceProvider } from '../services/bluetooth';
import BluetoothDemo from '../components/BluetoothDemo';

export default function BluetoothPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Bluetooth Demo</h1>
      <p className="mb-6 text-gray-600">
        This demo showcases the integration of Bluetooth Low Energy functionality using Capacitor plugins.
        You can scan for nearby Bluetooth devices, connect to them, and interact with their services and characteristics.
      </p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <BluetoothServiceProvider>
          <BluetoothDemo />
        </BluetoothServiceProvider>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Uses <code>@capacitor-community/bluetooth-le</code> plugin for native functionality</li>
          <li>Provides web fallbacks when running as a PWA</li>
          <li>Implements a unified service layer for consistent API access</li>
          <li>Handles platform-specific permissions and configurations</li>
        </ul>
      </div>
    </div>
  );
}