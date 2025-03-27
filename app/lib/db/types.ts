/**
 * 数据库访问层类型定义
 */
import { HomeItem, ListItem, Notification } from '@/app/types/type';

/**
 * 统一的数据库客户端接口
 * 所有环境（mock、local、cloud）都实现相同的接口
 */
export interface DatabaseClient {
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
  
  // 数据库初始化和管理
  initialize(): Promise<void>;
  reset(): Promise<void>;
}

/**
 * 数据库配置选项
 */
export interface DatabaseConfig {
  debug?: boolean;
}