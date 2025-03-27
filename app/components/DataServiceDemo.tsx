/**
 * 数据服务演示组件
 * 展示如何在组件中使用数据服务层
 */
'use client';

import { useEffect, useState } from 'react';
import { useDataService } from '@/app/services/data';
import { HomeItem, ListItem, Notification } from '@/app/types/type';

export default function DataServiceDemo() {
  const dataService = useDataService();
  const [status, setStatus] = useState<string>('初始化中...');
  const [lists, setLists] = useState<ListItem[]>([]);
  const [homeItems, setHomeItems] = useState<HomeItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setStatus('加载数据中...');
        
        // 并行加载所有数据
        const [listsData, homeItemsData, notificationsData] = await Promise.all([
          dataService.getLists(),
          dataService.getHomeItems(),
          dataService.getNotifications()
        ]);
        
        setLists(listsData);
        setHomeItems(homeItemsData);
        setNotifications(notificationsData);
        setStatus('数据已加载');
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setStatus('加载数据失败');
        setError(err instanceof Error ? err : new Error('未知错误'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dataService]);
  
  // 重置数据
  const handleReset = async () => {
    try {
      setIsLoading(true);
      setStatus('重置数据中...');
      await dataService.reset();
      
      // 重新加载数据
      const [listsData, homeItemsData, notificationsData] = await Promise.all([
        dataService.getLists(),
        dataService.getHomeItems(),
        dataService.getNotifications()
      ]);
      
      setLists(listsData);
      setHomeItems(homeItemsData);
      setNotifications(notificationsData);
      setStatus('数据已重置');
      setError(null);
    } catch (err) {
      console.error('Failed to reset data:', err);
      setStatus('重置数据失败');
      setError(err instanceof Error ? err : new Error('未知错误'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // 添加新列表
  const handleAddList = async () => {
    try {
      setStatus('添加列表中...');
      const newList = await dataService.addList({
        name: `新列表 ${new Date().toLocaleTimeString()}`,
        items: [{ name: '新项目' }]
      });
      
      // 更新列表数据
      setLists(prevLists => [...prevLists, newList]);
      setStatus(`已添加列表: ${newList.name}`);
    } catch (err) {
      console.error('Failed to add list:', err);
      setStatus('添加列表失败');
      setError(err instanceof Error ? err : new Error('未知错误'));
    }
  };
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">数据服务错误</h3>
        <p>{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">数据服务演示</h2>
      
      <div className="mb-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-bold mb-2">列表 ({lists.length})</h3>
          <ul className="border rounded-md divide-y">
            {lists.map((list, index) => (
              <li key={list.id} className="p-2">
                <strong>{list.name}</strong>
                <span className="text-gray-500 text-sm ml-2">({list.items?.length || 0} 项)</span>
              </li>
            ))}
            {lists.length === 0 && (
              <li className="p-2 text-gray-500">暂无列表</li>
            )}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-2">通知 ({notifications.length})</h3>
          <ul className="border rounded-md divide-y">
            {notifications.map((notification, index) => (
              <li key={index} className="p-2">
                <strong>{notification.title}</strong>
                <span className="text-gray-500 text-sm ml-2">{notification.when}</span>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="p-2 text-gray-500">暂无通知</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}