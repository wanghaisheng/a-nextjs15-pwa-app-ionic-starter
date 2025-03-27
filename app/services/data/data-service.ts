/**
 * 数据服务实现
 * 提供统一的数据访问接口，实现数据和页面分离
 */
import { CapacitorBaseService } from '../base-service';
import { ServiceConfig } from '../types';
import { HomeItem, ListItem, Notification } from '@/app/types/type';
import db from '@/app/lib/db';

/**
 * 数据服务类
 * 封装对数据库层的访问，提供统一的数据操作接口
 */
export class DataService extends CapacitorBaseService {
  private initialized: boolean = false;

  constructor(config?: ServiceConfig) {
    super(config);
  }

  /**
   * 初始化数据服务
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.log('Initializing data service');
      await db.initialize();
      this.initialized = true;
      this.log('Data service initialized');
    } catch (error) {
      this.log('Failed to initialize data service', error);
      throw this.createError('DATA_INIT_ERROR', 'Failed to initialize data service', error);
    }
  }

  /**
   * 重置数据服务
   */
  public async reset(): Promise<void> {
    try {
      this.log('Resetting data service');
      await db.reset();
      this.log('Data service reset');
    } catch (error) {
      this.log('Failed to reset data service', error);
      throw this.createError('DATA_RESET_ERROR', 'Failed to reset data service', error);
    }
  }

  // 首页项目相关操作
  public async getHomeItems(): Promise<HomeItem[]> {
    return this.safeExecute(
      () => db.getHomeItems(),
      'DATA_FETCH_ERROR',
      'Failed to fetch home items'
    );
  }

  public async addHomeItem(item: HomeItem): Promise<HomeItem> {
    return this.safeExecute(
      () => db.addHomeItem(item),
      'DATA_ADD_ERROR',
      'Failed to add home item'
    );
  }

  public async updateHomeItem(id: string, item: Partial<HomeItem>): Promise<HomeItem> {
    return this.safeExecute(
      () => db.updateHomeItem(id, item),
      'DATA_UPDATE_ERROR',
      'Failed to update home item'
    );
  }

  public async deleteHomeItem(id: string): Promise<boolean> {
    return this.safeExecute(
      () => db.deleteHomeItem(id),
      'DATA_DELETE_ERROR',
      'Failed to delete home item'
    );
  }

  // 列表相关操作
  public async getLists(): Promise<ListItem[]> {
    return this.safeExecute(
      () => db.getLists(),
      'DATA_FETCH_ERROR',
      'Failed to fetch lists'
    );
  }

  public async getListById(id: string): Promise<ListItem | null> {
    return this.safeExecute(
      () => db.getListById(id),
      'DATA_FETCH_ERROR',
      'Failed to fetch list'
    );
  }

  public async addList(list: Omit<ListItem, 'id'>): Promise<ListItem> {
    return this.safeExecute(
      () => db.addList(list),
      'DATA_ADD_ERROR',
      'Failed to add list'
    );
  }

  public async updateList(id: string, list: Partial<ListItem>): Promise<ListItem> {
    return this.safeExecute(
      () => db.updateList(id, list),
      'DATA_UPDATE_ERROR',
      'Failed to update list'
    );
  }

  public async deleteList(id: string): Promise<boolean> {
    return this.safeExecute(
      () => db.deleteList(id),
      'DATA_DELETE_ERROR',
      'Failed to delete list'
    );
  }

  // 列表项操作
  public async addListItem(listId: string, item: { name: string }): Promise<ListItem> {
    return this.safeExecute(
      () => db.addListItem(listId, item),
      'DATA_ADD_ERROR',
      'Failed to add list item'
    );
  }

  public async updateListItem(listId: string, itemIndex: number, updates: Partial<{ name: string, done: boolean }>): Promise<ListItem> {
    return this.safeExecute(
      () => db.updateListItem(listId, itemIndex, updates),
      'DATA_UPDATE_ERROR',
      'Failed to update list item'
    );
  }

  public async deleteListItem(listId: string, itemIndex: number): Promise<ListItem> {
    return this.safeExecute(
      () => db.deleteListItem(listId, itemIndex),
      'DATA_DELETE_ERROR',
      'Failed to delete list item'
    );
  }

  // 通知相关操作
  public async getNotifications(): Promise<Notification[]> {
    return this.safeExecute(
      () => db.getNotifications(),
      'DATA_FETCH_ERROR',
      'Failed to fetch notifications'
    );
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    return this.safeExecute(
      () => db.addNotification(notification),
      'DATA_ADD_ERROR',
      'Failed to add notification'
    );
  }

  public async deleteNotification(index: number): Promise<boolean> {
    return this.safeExecute(
      () => db.deleteNotification(index),
      'DATA_DELETE_ERROR',
      'Failed to delete notification'
    );
  }
}