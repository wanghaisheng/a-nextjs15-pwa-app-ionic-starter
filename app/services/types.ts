/**
 * Common types for Capacitor plugin services
 */

/**
 * Standard error format for all services
 */
export interface ServiceError {
  code: string;
  message: string;
  native?: any; // Original native error if available
  stack?: string;
}

/**
 * Platform detection utility type
 */
export enum Platform {
  Web = 'web',
  Android = 'android',
  iOS = 'ios',
  Unknown = 'unknown'
}

/**
 * Base interface for all plugin services
 */
export interface BaseService {
  /**
   * The current platform the service is running on
   */
  platform: Platform;
  
  /**
   * Whether the service is available on the current platform
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Initialize the service
   */
  initialize(): Promise<void>;
}

/**
 * Configuration options for services
 */
export interface ServiceConfig {
  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
  
  /**
   * Whether to mock native functionality in web environment
   */
  mockInWeb?: boolean;
}