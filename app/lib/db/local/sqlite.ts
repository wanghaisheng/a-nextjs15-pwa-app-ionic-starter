/**
 * SQLite数据库实现
 * 使用@capacitor-community/sqlite插件在移动设备和Web上提供SQLite支持
 */
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { HomeItem, ListItem, Notification } from '@/app/types/type';
import { DatabaseClient, DatabaseConfig } from '../types';

/**
 * SQLite数据库实现
 */
class SQLiteDatabase implements DatabaseClient {
  private connection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private debug: boolean;
  private dbName = 'app-sqlite-db';
  private initialized = false;

  constructor(config?: DatabaseConfig) {
    this.debug = config?.debug || false;
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    this.log('Initializing SQLite database');
    
    if (this.initialized) {
      return;
    }
    
    try {
      // 创建连接
      this.connection = new SQLiteConnection(CapacitorSQLite);
      
      // 验证连接并创建数据库
      const isConnection = await this.connection.checkConnectionsConsistency();
      const isDB = (await this.connection.isDatabase(this.dbName)).result;
      
      if (isConnection) {
        this.log('Connections are consistent');
      }
      
      if (!isDB) {
        this.log(`Database ${this.dbName} does not exist, creating...`);
        await this.connection.createConnection(this.dbName, false, 'no-encryption', 1);
      }
      
      // 打开连接
      this.db = await this.connection.retrieveConnection(this.dbName);
      await this.db.open();
      
      // 创建表
      await this.createTables();
      
      this.initialized = true;
      this.log('SQLite database initialized');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw new Error('Failed to initialize SQLite database');
    }
  }

  /**
   * 创建数据库表
   */
  private async createTables(): Promise<void> {
    this.log('Creating tables if not exist');
    
    // 创建homeItems表
    await this.db!.execute({
      statement: `
        CREATE TABLE IF NOT EXISTS homeItems (
          title TEXT PRIMARY KEY,
          type TEXT,
          text TEXT,
          author TEXT,
          authorAvatar TEXT,
          image TEXT
        )
      `
    });
    
    // 创建lists表
    await this.db!.execute({
      statement: `
        CREATE TABLE IF NOT EXISTS lists (
          id TEXT PRIMARY KEY,
          name TEXT,
          done INTEGER DEFAULT 0
        )
      `
    });
    
    // 创建listItems表
    await this.db!.execute({
      statement: `
        CREATE TABLE IF NOT EXISTS listItems (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          listId TEXT,
          name TEXT,
          done INTEGER DEFAULT 0,
          FOREIGN KEY (listId) REFERENCES lists (id) ON DELETE CASCADE
        )
      `
    });
    
    // 创建notifications表
    await this.db!.execute({
      statement: `
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          when TEXT
        )
      `
    });
  }

  /**
   * 重置数据库
   */
  public async reset(): Promise<void> {
    this.log('Resetting SQLite database');
    
    if (!this.initialized) {
      await this.initialize();
      return;
    }
    
    try {
      // 删除所有表中的数据
      await this.db!.execute({ statement: 'DELETE FROM homeItems' });
      await this.db!.execute({ statement: 'DELETE FROM listItems' });
      await this.db!.execute({ statement: 'DELETE FROM lists' });
      await this.db!.execute({ statement: 'DELETE FROM notifications' });
      
      this.log('SQLite database reset');
    } catch (error) {
      console.error('Failed to reset SQLite database:', error);
      throw new Error('Failed to reset SQLite database');
    }
  }

  // 首页项目相关操作
  public async getHomeItems(): Promise<HomeItem[]> {
    this.log('Getting home items');
    await this.ensureInitialized();
    
    const result = await this.db!.query({
      statement: 'SELECT * FROM homeItems'
    });
    
    return result.values || [];
  }

  public async addHomeItem(item: HomeItem): Promise<HomeItem> {
    this.log('Adding home item', item);
    await this.ensureInitialized();
    
    await this.db!.run({
      statement: `
        INSERT INTO homeItems (title, type, text, author, authorAvatar, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      values: [
        item.title,
        item.type,
        item.text,
        item.author,
        item.authorAvatar,
        item.image
      ]
    });
    
    return item;
  }

  public async updateHomeItem(id: string, item: Partial<HomeItem>): Promise<HomeItem> {
    this.log('Updating home item', { id, item });
    await this.ensureInitialized();
    
    // 获取现有项目
    const existingResult = await this.db!.query({
      statement: 'SELECT * FROM homeItems WHERE title = ?',
      values: [id]
    });
    
    if (!existingResult.values || existingResult.values.length === 0) {
      throw new Error(`Home item with id ${id} not found`);
    }
    
    const existingItem = existingResult.values[0] as HomeItem;
    const updatedItem = { ...existingItem, ...item };
    
    // 构建更新语句
    const updateFields = [];
    const updateValues = [];
    
    if (item.type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(item.type);
    }
    
    if (item.text !== undefined) {
      updateFields.push('text = ?');
      updateValues.push(item.text);
    }
    
    if (item.author !== undefined) {
      updateFields.push('author = ?');
      updateValues.push(item.author);
    }
    
    if (item.authorAvatar !== undefined) {
      updateFields.push('authorAvatar = ?');
      updateValues.push(item.authorAvatar);
    }
    
    if (item.image !== undefined) {
      updateFields.push('image = ?');
      updateValues.push(item.image);
    }
    
    if (updateFields.length > 0) {
      await this.db!.run({
        statement: `UPDATE homeItems SET ${updateFields.join(', ')} WHERE title = ?`,
        values: [...updateValues, id]
      });
    }
    
    return updatedItem;
  }

  public async deleteHomeItem(id: string): Promise<boolean> {
    this.log('Deleting home item', { id });
    await this.ensureInitialized();
    
    const result = await this.db!.run({
      statement: 'DELETE FROM homeItems WHERE title = ?',
      values: [id]
    });
    
    return result.changes?.changes !== undefined && result.changes.changes > 0;
  }

  // 列表相关操作
  public async getLists(): Promise<ListItem[]> {
    this.log('Getting lists');
    await this.ensureInitialized();
    
    // 获取所有列表
    const listsResult = await this.db!.query({
      statement: 'SELECT * FROM lists'
    });
    
    const lists = listsResult.values || [];
    
    // 获取每个列表的项目
    for (const list of lists) {
      const itemsResult = await this.db!.query({
        statement: 'SELECT * FROM listItems WHERE listId = ?',
        values: [list.id]
      });
      
      list.items = itemsResult.values || [];
    }
    
    return lists;
  }

  public async getListById(id: string): Promise<ListItem | null> {
    this.log('Getting list by id', { id });
    await this.ensureInitialized();
    
    // 获取列表
    const listResult = await this.db!.query({
      statement: 'SELECT * FROM lists WHERE id = ?',
      values: [id]
    });
    
    if (!listResult.values || listResult.values.length === 0) {
      return null;
    }
    
    const list = listResult.values[0] as ListItem;
    
    // 获取列表项目
    const itemsResult = await this.db!.query({
      statement: 'SELECT * FROM listItems WHERE listId = ?',
      values: [id]
    });
    
    list.items = itemsResult.values || [];
    
    return list;
  }

  public async addList(list: Omit<ListItem, 'id'>): Promise<ListItem> {
    this.log('Adding list', list);
    await this.ensureInitialized();
    
    const id = uuidv4();
    
    // 添加列表
    await this.db!.run({
      statement: 'INSERT INTO lists (id, name, done) VALUES (?, ?, ?)',
      values: [id, list.name, list.done ? 1 : 0]
    });
    
    const newList: ListItem = {
      id,
      name: list.name,
      done: list.done,
      items: []
    };
    
    // 添加列表项目（如果有）
    if (list.items && list.items.length > 0) {
      for (const item of list.items) {
        await this.db!.run({
          statement: 'INSERT INTO listItems (listId, name, done) VALUES (?, ?, ?)',
          values: [id, item.name, item.done ? 1 : 0]
        });
      }
      
      newList.items = list.items;
    }
    
    return newList;
  }

  public async updateList(id: string, list: Partial<ListItem>): Promise<ListItem> {
    this.log('Updating list', { id, list });
    await this.ensureInitialized();
    
    // 获取现有列表
    const existingList = await this.getListById(id);
    if (!existingList) {
      throw new Error(`List with id ${id} not found`);
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (list.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(list.name);
    }
    
    if (list.done !== undefined) {
      updateFields.push('done = ?');
      updateValues.push(list.done ? 1 : 0);
    }
    
    if (updateFields.length > 0) {
      await this.db!.run({
        statement: `UPDATE lists SET ${updateFields.join(', ')} WHERE id = ?`,
        values: [...updateValues, id]
      });
    }
    
    // 更新列表项目（如果提供）
    if (list.items !== undefined) {
      // 删除现有项目
      await this.db!.run({
        statement: 'DELETE FROM listItems WHERE listId = ?',
        values: [id]
      });
      
      // 添加新项目
      for (const item of list.items) {
        await this.db!.run({
          statement: 'INSERT INTO listItems (listId, name, done) VALUES (?, ?, ?)',
          values: [id, item.name, item.done ? 1 : 0]
        });
      }
    }
    
    // 获取更新后的列表
    return await this.getListById(id) as ListItem;
  }

  public async deleteList(id: string): Promise<boolean> {
    this.log('Deleting list', { id });
    await this.ensureInitialized();
    
    // 删除列表（级联删除会自动删除相关项目）
    const result = await this.db!.run({
      statement: 'DELETE FROM lists WHERE id = ?',
      values: [id]
    });
    
    return result.changes?.changes !== undefined && result.changes.changes > 0;
  }

  // 列表项操作
  public async addListItem(listId: string, item: { name: string }): Promise<ListItem> {
    this.log('Adding list item', { listId, item });
    await this.ensureInitialized();
    
    // 检查列表是否存在
    const list = await this.getListById(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    // 添加列表项
    await this.db!.run({
      statement: 'INSERT INTO listItems (listId, name, done) VALUES (?, ?, ?)',
      values: [listId, item.name, 0]
    });
    
    // 返回更新后的列表
    return await this.getListById(listId) as ListItem;
  }

  public async updateListItem(listId: string, itemIndex: number, updates: Partial<{ name: string, done: boolean }>): Promise<ListItem> {
    this.log('Updating list item', { listId, itemIndex, updates });
    await this.ensureInitialized();
    
    // 获取列表及其项目
    const list = await this.getListById(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!list.items || itemIndex >= list.items.length) {
      throw new Error(`Item at index ${itemIndex} not found in list ${listId}`);
    }
    
    // 获取项目ID
    const itemId = (list.items[itemIndex] as any).id;
    if (!itemId) {
      throw new Error(`Item at index ${itemIndex} has no ID`);
    }
    
    // 构建更新语句
    const updateFields = [];
    const updateValues = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updates.name);
    }
    
    if (updates.done !== undefined) {
      updateFields.push('done = ?');
      updateValues.push(updates.done ? 1 : 0);
    }
    
    if (updateFields.length > 0) {
      await this.db!.run({
        statement: `UPDATE listItems SET ${updateFields.join(', ')} WHERE id = ?`,
        values: [...updateValues, itemId]
      });
    }
    
    // 返回更新后的列表
    return await this.getListById(listId) as ListItem;
  }

  public async deleteListItem(listId: string, itemIndex: number): Promise<ListItem> {
    this.log('Deleting list item', { listId, itemIndex });
    await this.ensureInitialized();
    
    // 获取列表及其项目
    const list = await this.getListById(listId);
    if (!list) {
      throw new Error(`List with id ${listId} not found`);
    }
    
    if (!list.items || itemIndex >= list.items.length) {
      throw new Error(`Item at index ${itemIndex} not found in list ${listId}`);
    }
    
    // 获取项目ID
    const itemId = (list.items[itemIndex] as any).id;
    if (!itemId) {
      throw new Error(`Item at index ${itemIndex} has no ID`);
    }
    
    // 删除项目
    await this.db!.run({
      statement: 'DELETE FROM listItems WHERE id = ?',
      values: [itemId]
    });
    
    // 返回更新后的列表
    return await this.getListById(listId) as ListItem;
  }

  // 通知相关操作
  public async getNotifications(): Promise<Notification[]> {
    this.log('Getting notifications');
    await this.ensureInitialized();
    
    const result = await this.db!.query({
      statement: 'SELECT * FROM notifications'
    });
    
    return result.values || [];
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    this.log('Adding notification', notification);
    await this.ensureInitialized();
    
    await this.db!.run({
      statement: 'INSERT INTO notifications (title, when) VALUES (?, ?)',
      values: [notification.title, notification.when]
    });
    
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
      
      // 获取通知ID
      const notificationId = (notifications[index] as any).id;
      if (!notificationId) {
        return false;
      }
      
      // 删除通知
      const result = await this.db!.run({
        statement: 'DELETE FROM notifications WHERE id = ?',
        values: [notificationId]
      });
      
      return result.changes?.changes !== undefined && result.changes.changes > 0;
    } catch (error) {
      console.error(`Failed to delete notification at index ${index}:`, error);
      return false;
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 调试日志
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[SQLiteDatabase] ${message}`, data ? data : '');
    }
  }
}

// 导出单例实例
const sqliteDatabase = new SQLiteDatabase();
export default sqliteDatabase;