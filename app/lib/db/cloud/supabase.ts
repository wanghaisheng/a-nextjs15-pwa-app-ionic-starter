/**
 * Supabase数据库实现
 * 使用Supabase客户端与PostgreSQL数据库交互
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { HomeItem, ListItem, Notification } from '@/app/types/type';
import { DatabaseClient, DatabaseConfig } from '../types';

/**
 * Supabase数据库实现
 */
class SupabaseDatabase implements DatabaseClient {
  private client: SupabaseClient | null = null;
  private debug: boolean;
  private initialized = false;

  constructor(config?: DatabaseConfig) {
    this.debug = config?.debug || false;
  }

  /**
   * 初始化数据库连接
   */
  public async initialize(): Promise<void> {
    this.log('Initializing Supabase database connection');
    
    if (this.initialized) {
      return;
    }
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and anon key must be provided in environment variables');
      }
      
      this.client = createClient(supabaseUrl, supabaseKey);
      
      // 验证连接
      const { error } = await this.client.from('homeItems').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Failed to connect to Supabase: ${error.message}`);
      }
      
      this.initialized = true;
      this.log('Supabase database connection initialized');
    } catch (error) {
      console.error('Failed to initialize Supabase database:', error);
      throw new Error('Failed to initialize Supabase database connection');
    }
  }

  /**
   * 重置数据库（仅用于开发/测试）
   */
  public async reset(): Promise<void> {
    this.log('Resetting Supabase database');
    await this.ensureInitialized();
    
    try {
      // 清空所有表
      await this.client!.from('homeItems').delete().neq('title', 'impossible_value');
      await this.client!.from('listItems').delete().neq('id', -1);
      await this.client!.from('lists').delete().neq('id', 'impossible_value');
      await this.client!.from('notifications').delete().neq('id', -1);
      
      this.log('Supabase database reset');
    } catch (error) {
      console.error('Failed to reset Supabase database:', error);
      throw new Error('Failed to reset Supabase database');
    }
  }

  // 首页项目相关操作
  public async getHomeItems(): Promise<HomeItem[]> {
    this.log('Getting home items');
    await this.ensureInitialized();
    
    const { data, error } = await this.client!.from('homeItems').select('*');
    
    if (error) {
      throw new Error(`Failed to get home items: ${error.message}`);
    }
    
    return data || [];
  }

  public async addHomeItem(item: HomeItem): Promise<HomeItem> {
    this.log('Adding home item', item);
    await this.ensureInitialized();
    
    const { data, error } = await this.client!.from('homeItems').insert(item).select().single();
    
    if (error) {
      throw new Error(`Failed to add home item: ${error.message}`);
    }
    
    return data as HomeItem;
  }

  public async updateHomeItem(id: string, item: Partial<HomeItem>): Promise<HomeItem> {
    this.log('Updating home item', { id, item });
    await this.ensureInitialized();
    
    const { data, error } = await this.client!
      .from('homeItems')
      .update(item)
      .eq('title', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update home item: ${error.message}`);
    }
    
    return data as HomeItem;
  }

  public async deleteHomeItem(id: string): Promise<boolean> {
    this.log('Deleting home item', { id });
    await this.ensureInitialized();
    
    const { error } = await this.client!.from('homeItems').delete().eq('title', id);
    
    if (error) {
      throw new Error(`Failed to delete home item: ${error.message}`);
    }
    
    return true;
  }

  // 列表相关操作
  public async getLists(): Promise<ListItem[]> {
    this.log('Getting lists');
    await this.ensureInitialized();
    
    // 获取所有列表
    const { data: lists, error: listsError } = await this.client!.from('lists').select('*');
    
    if (listsError) {
      throw new Error(`Failed to get lists: ${listsError.message}`);
    }
    
    if (!lists || lists.length === 0) {
      return [];
    }
    
    // 获取所有列表项
    const { data: items, error: itemsError } = await this.client!
      .from('listItems')
      .select('*')
      .in('listId', lists.map(list => list.id));
    
    if (itemsError) {
      throw new Error(`Failed to get list items: ${itemsError.message}`);
    }
    
    // 将项目添加到对应的列表中
    const listsWithItems = lists.map(list => ({
      ...list,
      items: items?.filter(item => item.listId === list.id) || []
    }));
    
    return listsWithItems;
  }

  public async getListById(id: string): Promise<ListItem | null> {
    this.log('Getting list by id', { id });
    await this.ensureInitialized();
    
    // 获取列表
    const { data: list, error: listError } = await this.client!
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (listError) {
      if (listError.code === 'PGRST116') { // 没有找到记录
        return null;
      }
      throw new Error(`Failed to get list: ${listError.message}`);
    }
    
    if (!list) {
      return null;
    }
    
    // 获取列表项
    const { data: items, error: itemsError } = await this.client!
      .from('listItems')
      .select('*')
      .eq('listId', id);
    
    if (itemsError) {
      throw new Error(`Failed to get list items: ${itemsError.message}`);
    }
    
    return {
      ...list,
      items: items || []
    };
  }

  public async addList(list: Omit<ListItem, 'id'>): Promise<ListItem> {
    this.log('Adding list', list);
    await this.ensureInitialized();
    
    const id = uuidv4();
    const newList = {
      id,
      name: list.name,
      done: list.done || false
    };
    
    // 添加列表
    const { error: listError } = await this.client!.from('lists').insert(newList);
    
    if (listError) {
      throw new Error(`Failed to add list: ${listError.message}`);
    }
    
    // 添加列表项（如果有）
    if (list.items && list.items.length > 0) {
      const listItems = list.items.map(item => ({
        listId: id,
        name: item.name,
        done: item.done || false
      }));
      
      const { error: itemsError } = await this.client!.from('listItems').insert(listItems);
      
      if (itemsError) {
        throw new Error(`Failed to add list items: ${itemsError.message}`);
      }
    }
    
    // 返回完整的列表
    return this.getListById(id) as Promise<ListItem>;
  }

  public async updateList(id: string, list: Partial<ListItem>): Promise<ListItem> {
    this.log('Updating list', { id, list });
    await this.ensureInitialized();
    
    const updates: any = {};
    
    if (list.name !== undefined) {
      updates.name = list.name;
    }
    
    if (list.done !== undefined) {
      updates.done = list.done;
    }
    
    // 更新列表
    if (Object.keys(updates).length > 0) {
      const { error } = await this.client!.from('lists').update(updates).eq('id', id);
      
      if (error) {
        throw new Error(`Failed to update list: ${error.message}`);
      }
    }
    
    // 更新列表项（如果提供）
    if (list.items !== undefined) {
      // 删除现有项目
      const { error: deleteError } = await this.client!.from('listItems').delete().eq('listId', id);
      
      if (deleteError) {
        throw new Error(`Failed to delete list items: ${deleteError.message}`);
      }
      
      // 添加新项目
      if (list.items.length > 0) {
        const listItems = list.items.map(item => ({
          listId: id,
          name: item.name,
          done: item.done || false
        }));
        
        const { error: insertError } = await this.client!.from('listItems').insert(listItems);
        
        if (insertError) {
          throw new Error(`Failed to add list items: ${insertError.message}`);
        }
      }
    }
    
    // 返回更新后的列表
    return this.getListById(id) as Promise<ListItem>;
  }

  public async deleteList(id: string): Promise<boolean> {
    this.log('Deleting list', { id });
    await this.ensureInitialized();
    
    // 删除列表项
    const { error: itemsError } = await this.client!.from('listItems').delete().eq('listId', id);
    
    if (itemsError) {
      throw new Error(`Failed to delete list items: ${itemsError.message}`);
    }
    
    // 删除列表
    const { error: listError } = await this.client!.from('lists').delete().eq('id', id);
    
    if (listError) {
      throw new Error(`Failed to delete list: ${listError.message}`);
    }
    
    return true;
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
    const { error } = await this.client!.from('listItems').insert({
      listId,
      name: item.name,
      done: false
    });
    
    if (error) {
      throw new Error(`Failed to add list item: ${error.message}`);
    }
    
    // 返回更新后的列表
    return this.getListById(listId) as Promise<ListItem>;
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
    
    // 更新项目
    const updateData: any = {};
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    
    if (updates.done !== undefined) {
      updateData.done = updates.done;
    }
    
    const { error } = await this.client!
      .from('listItems')
      .update(updateData)
      .eq('id', itemId);
    
    if (error) {
      throw new Error(`Failed to update list item: ${error.message}`);
    }
    
    // 返回更新后的列表
    return this.getListById(listId) as Promise<ListItem>;
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
    const { error } = await this.client!.from('listItems').delete().eq('id', itemId);
    
    if (error) {
      throw new Error(`Failed to delete list item: ${error.message}`);
    }
    
    // 返回更新后的列表
    return this.getListById(listId) as Promise<ListItem>;
  }

  // 通知相关操作
  public async getNotifications(): Promise<Notification[]> {
    this.log('Getting notifications');
    await this.ensureInitialized();
    
    const { data, error } = await this.client!.from('notifications').select('*');
    
    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
    
    return data || [];
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    this.log('Adding notification', notification);
    await this.ensureInitialized();
    
    const { data, error } = await this.client!
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to add notification: ${error.message}`);
    }
    
    return data as Notification;
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
      const { error } = await this.client!.from('notifications').delete().eq('id', notificationId);
      
      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }
      
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
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 调试日志
   */
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[SupabaseDatabase] ${message}`, data ? data : '');
    }
  }
}

// 导出单例实例
const supabaseDatabase = new SupabaseDatabase();
export default supabaseDatabase;