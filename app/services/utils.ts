/**
 * Utility functions for Capacitor plugin services
 */
import { Capacitor } from '@capacitor/core';
import { Platform, ServiceError } from './types';

/**
 * Detect the current platform
 */
export function getPlatform(): Platform {
  if (!Capacitor.isNativePlatform()) {
    return Platform.Web;
  }
  
  const platform = Capacitor.getPlatform();
  
  switch (platform) {
    case 'android':
      return Platform.Android;
    case 'ios':
      return Platform.iOS;
    default:
      return Platform.Unknown;
  }
}

/**
 * Check if the app is running in a native environment
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Create a standardized service error
 */
export function createError(code: string, message: string, nativeError?: any): ServiceError {
  return {
    code,
    message,
    native: nativeError,
    stack: new Error().stack
  };
}

/**
 * Log a message with optional data if debug is enabled
 */
export function debugLog(debug: boolean, message: string, ...data: any[]): void {
  if (debug) {
    console.log(`[CapacitorService] ${message}`, ...data);
  }
}

/**
 * Safely execute a function and handle errors
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorCode: string,
  errorMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw createError(errorCode, errorMessage, error);
  }
}