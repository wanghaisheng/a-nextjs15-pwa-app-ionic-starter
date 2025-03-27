/**
 * 数据服务类型定义
 */
import { HomeItem, ListItem, Notification } from '@/app/types/type';

/**
 * 数据服务接口
 * 定义数据服务提供的所有方法
 */
export interface DataServiceInterface {
  // 首页项目相关操作
  getHomeItems(): Promise<HomeItem[]>;
  addHomeItem(item: HomeItem): Promise<HomeItem>;
  updateHomeItem(id: string, item: Partial<HomeItem>): Promise<HomeItem>;
  deleteHomeItem(id: string): Promise<boolean>;
  
  // 列表相关操作
  getLists(): Promise<ListItem[]>;
  getListById(id: string): Promise<ListItem | null>;
  addList(list: Omit<ListItem, 'id'>): Promise<ListItem>;
  updateList(id: string, list: Partial<ListItem>): Promise<ListItem>;
  deleteList(id: string): Promise<boolean>;
  
  // 列表项操作
  addListItem(listId: string, item: { name: string }): Promise<ListItem>;
  updateListItem(listId: string, itemIndex: number, updates: Partial<{ name: string, done: boolean }>): Promise<ListItem>;
  deleteListItem(listId: string, itemIndex: number): Promise<ListItem>;
  
  // 通知相关操作
  getNotifications(): Promise<Notification[]>;
  addNotification(notification: Notification): Promise<Notification>;
  deleteNotification(index: number): Promise<boolean>;
  
  // 数据服务管理
  initialize(): Promise<void>;
  reset(): Promise<void>;
}

/**
 * 数据操作结果
 */
export interface DataResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 数据同步状态
 */
export enum SyncStatus {
  Idle = 'idle',
  Syncing = 'syncing',
  Completed = 'completed',
  Failed = 'failed'
}

/**
 * 数据同步信息
 */
export interface SyncInfo {
  lastSyncTime?: Date;
  status: SyncStatus;
  error?: string;
}