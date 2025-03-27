/**
 * Mock数据库实现
 * 使用内存中的数据结构模拟数据库操作
 */
import { v4 as uuidv4 } from 'uuid';
import { homeItems, lists, notifications } from '@/app/mock/data';
import { HomeItem, ListItem, Notification } from '@/app/types/type';
import { DatabaseClient, DatabaseConfig } from '../types';

/**
 * 内存中的数据存储
 */
class MockDatabase implements DatabaseClient {
  private homeItems: HomeItem[] = [];
  private lists: ListItem[] = [];
  private notifications: Notification[] = [];
  private debug: boolean;

  constructor(config?: DatabaseConfig) {
    this.debug = config?.debug || false;
  }

  /**
   * 初始化数据库，加载mock数据
   */
  public async initialize(): Promise<void> {
    this.log('Initializing mock database');
    // 深拷贝初始数据，避免直接修改导入的数据
    this.homeItems = JSON.parse(JSON.stringify(homeItems));
    this.lists = JSON.parse(JSON.stringify(lists));
    this.notifications = JSON.parse(JSON.stringify(notifications));
    this.log('Mock database initialized with sample data');
  }

  /**
   * 重置数据库到初始状态
   */
  public async reset(): Promise<void> {
    this.log('Resetting mock database');
    await this.initialize();
  }

  // 首页项目相关操作
  public async getHomeItems(): Promise<HomeItem[]> {
    this.log('Getting home items');
    return [...this.homeItems];
  }

  public async addHomeItem(item: HomeItem): Promise<HomeItem> {
    this.log('Adding home item', item);
    this.homeItems.push(item);
    return item;
  }

  public async updateHomeItem(id: string, item: Partial<HomeItem>): Promise<HomeItem> {
    this.log('Updating home item', { id, item });
    const index = this.homeItems.findIndex(i => i.title === id); // 使用title作为临时ID
    
    if (index === -1) {
      throw new Error(`Home item with id ${id} not found`);
    }
    
    this.homeItems[index] = { ...this.homeItems[index], ...item };
    return this.homeItems[index];
  }

  public async deleteHomeItem(id: string): Promise<boolean> {
    this.log('Deleting home item', { id });
    const index = this.homeItems.findIndex(i => i.title === id); // 使用title作为临时ID
    
    if (index === -1) {
      return false;
    }
    
    this.homeItems.splice(index, 1);
    return true;
  }

  // 列表相关操作
  public async getLists(): Promise<ListItem[]> {
    this.log('Getting lists');
    return [...this.lists];
  }

  public async getListById(id: string): Promise<ListItem | null> {
    this.log('Getting list by id', { id });
    const list = this.lists.find(l => l.id === id);
    return list ? { ...list } : null;
  }

  public async addList(list: Omit<ListItem, 'id'>): Promise<ListItem> {
    this.log('Adding list', list);
    const newList: ListItem = {
      ...list,
      id: uuidv4(),
      items: list.items || [],
    };
    
    this.lists.push(newList);
    return { ...newList };
  }

  public async updateList(id: string, list: Partial<ListItem>): Promise<ListItem> {
    this.log('Updating list', { id, list });
    const index = this.lists.findIndex(l => l.id === id);
    
    if (index === -1) {
      throw new Error(`List with id ${id} not found`);
    }
    
    this.lists[index] = { ...this.lists[index], ...list };
    return { ...this.lists[index] };
  }

  public async deleteList(id: string): Promise<boolean> {
    this.log('Deleting list', { id });
    const index = this.lists.findIndex(l => l.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.lists.splice(index, 1);
    return true;
  }

  // 列表项操作
  public async addListItem(listId: string, item: { name: string }): Promise<ListItem> {
    this.log('Adding list item', { listId, item });
    const index = this.lists.findIndex(l => l.id === listId);
    
    if (index === -1) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!this.lists[index].items) {
      this.lists[index].items = [];
    }
    
    this.lists[index].items!.push({ ...item });
    return { ...this.lists[index] };
  }

  public async updateListItem(listId: string, itemIndex: number, updates: Partial<{ name: string, done: boolean }>): Promise<ListItem> {
    this.log('Updating list item', { listId, itemIndex, updates });
    const listIndex = this.lists.findIndex(l => l.id === listId);
    
    if (listIndex === -1) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!this.lists[listIndex].items || itemIndex >= this.lists[listIndex].items!.length) {
      throw new Error(`Item at index ${itemIndex} not found in list ${listId}`);
    }
    
    this.lists[listIndex].items![itemIndex] = {
      ...this.lists[listIndex].items![itemIndex],
      ...updates
    };
    
    return { ...this.lists[listIndex] };
  }

  public async deleteListItem(listId: string, itemIndex: number): Promise<ListItem> {
    this.log('Deleting list item', { listId, itemIndex });
    const listIndex = this.lists.findIndex(l => l.id === listId);
    
    if (listIndex === -1) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!this.lists[listIndex].items || itemIndex >= this.lists[listIndex].items!.length) {
      throw new Error(`Item at index ${itemIndex} not found in list ${listId}`);
    }
    
    this.lists[listIndex].items!.splice(itemIndex, 1);
    return { ...this.lists[listIndex] };
  }

  // 通知相关操作
  public async getNotifications(): Promise<Notification[]> {
    this.log('Getting notifications');
    return [...this.notifications];
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    this.log('Adding notification', notification);
    this.notifications.push(notification);
    return notification;
  }

  public async deleteNotification(index: number): Promise<boolean> {
    this.log('Deleting notification', { index });
    if (index < 0 || index >= this.notifications.length) {
      return false;
    }
    
    this.notifications.splice(index, 1);
    return true;
  }

  /**
   * 调试日志
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[MockDatabase] ${message}`, data ? data : '');
    }
  }
}

// 导出单例实例
const mockDatabase = new MockDatabase();
export default mockDatabase;