/**
 * 本地数据库实现
 * 使用IndexedDB在浏览器中存储数据
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { HomeItem, ListItem, Notification } from '@/app/types/type';
import { DatabaseClient, DatabaseConfig } from '../types';

/**
 * 定义数据库结构
 */
interface AppDB extends DBSchema {
  homeItems: {
    key: string;
    value: HomeItem;
    indexes: { 'by-title': string };
  };
  lists: {
    key: string;
    value: ListItem;
  };
  notifications: {
    key: number;
    value: Notification;
  };
}

/**
 * 本地IndexedDB数据库实现
 */
class LocalDatabase implements DatabaseClient {
  private db: IDBPDatabase<AppDB> | null = null;
  private debug: boolean;
  private dbName = 'app-local-db';
  private dbVersion = 1;

  constructor(config?: DatabaseConfig) {
    this.debug = config?.debug || false;
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    this.log('Initializing local database');
    
    if (this.db) {
      return;
    }
    
    try {
      this.db = await openDB<AppDB>(this.dbName, this.dbVersion, {
        upgrade: (db) => {
          // 创建存储对象
          if (!db.objectStoreNames.contains('homeItems')) {
            const homeItemsStore = db.createObjectStore('homeItems', { keyPath: 'title' });
            homeItemsStore.createIndex('by-title', 'title');
          }
          
          if (!db.objectStoreNames.contains('lists')) {
            db.createObjectStore('lists', { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains('notifications')) {
            db.createObjectStore('notifications', { autoIncrement: true });
          }
        },
      });
      
      this.log('Local database initialized');
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      throw new Error('Failed to initialize local database');
    }
  }

  /**
   * 重置数据库
   */
  public async reset(): Promise<void> {
    this.log('Resetting local database');
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    await deleteDB(this.dbName);
    await this.initialize();
  }

  // 首页项目相关操作
  public async getHomeItems(): Promise<HomeItem[]> {
    this.log('Getting home items');
    await this.ensureInitialized();
    return this.db!.getAll('homeItems');
  }

  public async addHomeItem(item: HomeItem): Promise<HomeItem> {
    this.log('Adding home item', item);
    await this.ensureInitialized();
    await this.db!.add('homeItems', item);
    return item;
  }

  public async updateHomeItem(id: string, item: Partial<HomeItem>): Promise<HomeItem> {
    this.log('Updating home item', { id, item });
    await this.ensureInitialized();
    
    const existingItem = await this.db!.get('homeItems', id);
    if (!existingItem) {
      throw new Error(`Home item with id ${id} not found`);
    }
    
    const updatedItem = { ...existingItem, ...item };
    await this.db!.put('homeItems', updatedItem);
    return updatedItem;
  }

  public async deleteHomeItem(id: string): Promise<boolean> {
    this.log('Deleting home item', { id });
    await this.ensureInitialized();
    
    try {
      await this.db!.delete('homeItems', id);
      return true;
    } catch (error) {
      console.error(`Failed to delete home item ${id}:`, error);
      return false;
    }
  }

  // 列表相关操作
  public async getLists(): Promise<ListItem[]> {
    this.log('Getting lists');
    await this.ensureInitialized();
    return this.db!.getAll('lists');
  }

  public async getListById(id: string): Promise<ListItem | null> {
    this.log('Getting list by id', { id });
    await this.ensureInitialized();
    return this.db!.get('lists', id);
  }

  public async addList(list: Omit<ListItem, 'id'>): Promise<ListItem> {
    this.log('Adding list', list);
    await this.ensureInitialized();
    
    const newList: ListItem = {
      ...list,
      id: uuidv4(),
      items: list.items || [],
    };
    
    await this.db!.add('lists', newList);
    return newList;
  }

  public async updateList(id: string, list: Partial<ListItem>): Promise<ListItem> {
    this.log('Updating list', { id, list });
    await this.ensureInitialized();
    
    const existingList = await this.db!.get('lists', id);
    if (!existingList) {
      throw new Error(`List with id ${id} not found`);
    }
    
    const updatedList = { ...existingList, ...list };
    await this.db!.put('lists', updatedList);
    return updatedList;
  }

  public async deleteList(id: string): Promise<boolean> {
    this.log('Deleting list', { id });
    await this.ensureInitialized();
    
    try {
      await this.db!.delete('lists', id);
      return true;
    } catch (error) {
      console.error(`Failed to delete list ${id}:`, error);
      return false;
    }
  }

  // 列表项操作
  public async addListItem(listId: string, item: { name: string }): Promise<ListItem> {
    this.log('Adding list item', { listId, item });
    await this.ensureInitialized();
    
    const list = await this.getListById(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!list.items) {
      list.items = [];
    }
    
    list.items.push({ ...item });
    await this.db!.put('lists', list);
    return list;
  }

  public async updateListItem(listId: string, itemIndex: number, updates: Partial<{ name: string, done: boolean }>): Promise<ListItem> {
    this.log('Updating list item', { listId, itemIndex, updates });
    await this.ensureInitialized();
    
    const list = await this.getListById(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!list.items || itemIndex >= list.items.length) {
      throw new Error(`Item at index ${itemIndex} not found in list ${listId}`);
    }
    
    list.items[itemIndex] = {
      ...list.items[itemIndex],
      ...updates
    };
    
    await this.db!.put('lists', list);
    return list;
  }

  public async deleteListItem(listId: string, itemIndex: number): Promise<ListItem> {
    this.log('Deleting list item', { listId, itemIndex });
    await this.ensureInitialized();
    
    const list = await this.getListById(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!list.items || itemIndex >= list.items.length) {
      throw new Error(`Item at index ${itemIndex} not found in list ${listId}`);
    }
    
    list.items.splice(itemIndex, 1);
    await this.db!.put('lists', list);
    return list;
  }

  // 通知相关操作
  public async getNotifications(): Promise<Notification[]> {
    this.log('Getting notifications');
    await this.ensureInitialized();
    return this.db!.getAll('notifications');
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    this.log('Adding notification', notification);
    await this.ensureInitialized();
    await this.db!.add('notifications', notification);
    return notification;
  }

  public async deleteNotification(index: number): Promise<boolean> {
    this.log('Deleting notification', { index });
    await this.ensureInitialized();
    
    try {
      // 获取所有通知
      const notifications = await this.getNotifications();
      if (index < 0 || index >= notifications.length) {
        return false;
      }
      
      // 获取实际的键
      const keys = await this.db!.getAllKeys('notifications');
      if (index >= keys.length) {
        return false;
      }
      
      await this.db!.delete('notifications', keys[index]);
      return true;
    } catch (error) {
      console.error(`Failed to delete notification at index ${index}:`, error);
      return false;
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }

  /**
   * 调试日志
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[LocalDatabase] ${message}`, data ? data : '');
    }
  }
}

/**
 * 删除数据库
 */
async function deleteDB(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete database ${name}`));
  });
}

// 导出单例实例
const localDatabase = new LocalDatabase();
export default localDatabase;