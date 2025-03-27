/**
 * Base service class for all Capacitor plugin services
 */
import { BaseService, Platform, ServiceConfig, ServiceError } from './types';
import { createError, debugLog, getPlatform, isNative } from './utils';

/**
 * Abstract base class for all plugin services
 */
export abstract class CapacitorBaseService implements BaseService {
  protected debug: boolean;
  protected mockInWeb: boolean;
  public platform: Platform;

  constructor(config?: ServiceConfig) {
    this.debug = config?.debug || false;
    this.mockInWeb = config?.mockInWeb || false;
    this.platform = getPlatform();
    this.log('Service initialized');
  }

  /**
   * Check if the service is available on the current platform
   */
  public async isAvailable(): Promise<boolean> {
    return isNative() || this.mockInWeb;
  }

  /**
   * Initialize the service
   */
  public abstract initialize(): Promise<void>;

  /**
   * Log a message if debug is enabled
   */
  protected log(message: string, ...data: any[]): void {
    debugLog(this.debug, `[${this.constructor.name}] ${message}`, ...data);
  }

  /**
   * Create a standardized error
   */
  protected createError(code: string, message: string, nativeError?: any): ServiceError {
    return createError(code, message, nativeError);
  }

  /**
   * Safely execute a function and handle errors
   */
  protected async safeExecute<T>(
    fn: () => Promise<T>,
    errorCode: string,
    errorMessage: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.log('Error executing function', error);
      throw this.createError(errorCode, errorMessage, error);
    }
  }

  /**
   * Check if the service is running in a native environment
   */
  protected isNative(): boolean {
    return isNative();
  }

  /**
   * Check if the service should use web mocks
   */
  protected shouldUseMock(): boolean {
    return !this.isNative() && this.mockInWeb;
  }
}