/**
 * 数据库服务Hook
 * 提供对数据库客户端的访问
 */
import { useEffect, useState } from 'react';
import db, { DatabaseEnvironment, getDatabaseEnvironment } from '@/app/lib/db';
import { DatabaseClient } from '@/app/lib/db/types';

/**
 * 数据库服务Hook
 * 提供对数据库客户端的访问，并处理初始化逻辑
 */
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [environment, setEnvironment] = useState<DatabaseEnvironment>(getDatabaseEnvironment());

  // 初始化数据库
  useEffect(() => {
    let isMounted = true;

    const initializeDb = async () => {
      try {
        setIsLoading(true);
        await db.initialize();
        
        if (isMounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown database error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeDb();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 重置数据库
   */
  const resetDatabase = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await db.reset();
      setError(null);
    } catch (err) {
      console.error('Failed to reset database:', err);
      setError(err instanceof Error ? err : new Error('Unknown database error'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    db: db as DatabaseClient,
    isInitialized,
    isLoading,
    error,
    environment,
    resetDatabase,
  };
}