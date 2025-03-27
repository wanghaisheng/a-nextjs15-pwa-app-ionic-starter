/**
 * 数据库演示组件
 * 展示如何在组件中使用数据库和store
 */
'use client';

import { useEffect, useState } from 'react';
import { useDatabase } from '@/app/hooks/useDatabase';
import useAppStore from '@/app/hooks/useStore';
import { DatabaseEnvironment } from '@/app/lib/db';
import { useDataService } from '@/app/services/data';

export default function DatabaseDemo() {
  const { db, isLoading, error, environment, resetDatabase } = useDatabase();
  const store = useAppStore();
  const [status, setStatus] = useState<string>('初始化中...');
  
  // 初始化数据
  useEffect(() => {
    if (!isLoading) {
      store.initializeData();
      setStatus('数据已加载');
    }
  }, [isLoading, store]);
  
  // 获取环境名称
  const getEnvironmentName = (env: DatabaseEnvironment) => {
    switch (env) {
      case DatabaseEnvironment.Mock:
        return 'Mock数据';
      case DatabaseEnvironment.Local:
        return '本地数据库';
      case DatabaseEnvironment.Cloud:
        return '云端数据库';
      default:
        return '未知';
    }
  };
  
  // 重置数据库
  const handleReset = async () => {
    try {
      setStatus('重置中...');
      await resetDatabase();
      await store.initializeData();
      setStatus('数据已重置');
    } catch (err) {
      setStatus(`重置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };
  
  // 添加新列表
  const handleAddList = async () => {
    try {
      setStatus('添加中...');
      const newList = await db.addList({
        name: `新列表 ${new Date().toLocaleTimeString()}`,
        items: [{ name: '新项目' }]
      });
      await store.initializeData(); // 重新加载数据
      setStatus(`已添加列表: ${newList.name}`);
    } catch (err) {
      setStatus(`添加失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">数据库错误</h3>
        <p>{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">数据库演示</h2>
      
      <div className="mb-4">
        <p><strong>当前环境:</strong> {getEnvironmentName(environment)}</p>
        <p><strong>状态:</strong> {isLoading ? '加载中...' : status}</p>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
          disabled={isLoading}
        >
          重置数据
        </button>
        
        <button 
          onClick={handleAddList}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          disabled={isLoading}
        >
          添加列表
        </button>
      </div>
      
      <div>
        <h3 className="font-bold mb-2">当前列表:</h3>
        {store.lists.length === 0 ? (
          <p className="text-gray-500">暂无列表</p>
        ) : (
          <ul className="list-disc pl-5">
            {store.lists.map(list => (
              <li key={list.id}>
                {list.name} ({list.items?.length || 0} 项)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}