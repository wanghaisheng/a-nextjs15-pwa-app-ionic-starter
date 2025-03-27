/**
 * SQLite数据库客户端实现
 * 提供移动端SQLite数据库访问
 */
import { Capacitor } from '@capacitor/core';
import { DatabaseClient, DatabaseConfig } from '../../interfaces';
import { LocalizedString } from '../../../i18n/types';

// SQLite插件类型定义
interface SQLitePlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  createConnection(options: { database: string, encrypted: boolean, mode: string }): Promise<{ result: boolean }>;
  open(options: { database: string }): Promise<{ result: boolean }>;
  closeConnection(options: { database: string }): Promise<{ result: boolean }>;
  execute(options: { database: string, statements: string }): Promise<{ changes: number }>;
  executeSet(options: { database: string, statements: string[] }): Promise<{ changes: number[] }>;
  query(options: { database: string, statement: string, values?: any[] }): Promise<{ values: any[] }>;
}

/**
 * SQLite数据库客户端
 */
export class SQLiteClient implements DatabaseClient {
  private plugin: SQLitePlugin | null = null;
  private database: string;
  private isEncrypted: boolean;
  private isInitialized: boolean = false;

  constructor(config: DatabaseConfig = {}) {
    this.database = config.database || 'app_database';
    this.isEncrypted = !!config.encryptionKey;
  }

  /**
   * 初始化数据库连接
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 检查是否在原生平台上运行
      if (!Capacitor.isNativePlatform()) {
        console.warn('SQLite is only available on native platforms');
        throw new Error('SQLite is not available in this environment');
      }

      // 动态导入SQLite插件
      const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
      this.plugin = CapacitorSQLite;

      // 创建数据库连接
      await this.plugin.createConnection({
        database: this.database,
        encrypted: this.isEncrypted,
        mode: 'no-encryption' // 或者 'encryption' 如果启用加密
      });

      // 打开数据库连接
      await this.plugin.open({ database: this.database });

      // 初始化数据库结构
      await this.setupDatabase();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  /**
   * 设置数据库结构
   */
  private async setupDatabase(): Promise<void> {
    if (!this.plugin) throw new Error('SQLite plugin not initialized');

    // 创建必要的表
    const statements = [
      // 产品表
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        price REAL NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      // 产品本地化表
      `CREATE TABLE IF NOT EXISTS product_localizations (
        product_id TEXT NOT NULL,
        locale TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        PRIMARY KEY (product_id, locale),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`
    ];

    await this.plugin.executeSet({
      database: this.database,
      statements
    });
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (!this.plugin || !this.isInitialized) return;

    try {
      await this.plugin.closeConnection({ database: this.database });
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to close SQLite database:', error);
      throw error;
    }
  }

  /**
   * 重置数据库
   */
  async reset(): Promise<void> {
    if (!this.plugin) throw new Error('SQLite plugin not initialized');

    try {
      // 删除所有表并重新创建
      const statements = [
        'DROP TABLE IF EXISTS product_localizations',
        'DROP TABLE IF EXISTS products'
      ];

      await this.plugin.executeSet({
        database: this.database,
        statements
      });

      // 重新设置数据库结构
      await this.setupDatabase();
    } catch (error) {
      console.error('Failed to reset SQLite database:', error);
      throw error;
    }
  }

  /**
   * 获取本地化产品列表
   */
  async getLocalizedProducts(locale: string): Promise<any[]> {
    if (!this.plugin) throw new Error('SQLite plugin not initialized');

    try {
      const result = await this.plugin.query({
        database: this.database,
        statement: `
          SELECT p.id, p.price, pl.name, pl.description
          FROM products p
          LEFT JOIN product_localizations pl ON p.id = pl.product_id AND pl.locale = ?
          ORDER BY p.created_at DESC
        `,
        values: [locale]
      });

      return result.values.map(row => ({
        id: row.id,
        price: row.price,
        name: row.name || '',
        description: row.description || ''
      }));
    } catch (error) {
      console.error('Failed to get localized products:', error);
      throw error;
    }
  }

  /**
   * 创建产品
   */
  async createProduct(product: {
    name: LocalizedString;
    description: LocalizedString;
    price: number;
  }): Promise<any> {
    if (!this.plugin) throw new Error('SQLite plugin not initialized');

    try {
      // 生成产品ID
      const id = crypto.randomUUID();
      const now = Date.now();

      // 插入产品基本信息
      await this.plugin.execute({
        database: this.database,
        statements: `
          INSERT INTO products (id, price, created_at, updated_at)
          VALUES (?, ?, ?, ?)
        `,
        values: [id, product.price, now, now]
      });

      // 插入产品本地化信息
      const locales = Object.keys(product.name).filter(key => key !== 'default');
      for (const locale of locales) {
        await this.plugin.execute({
          database: this.database,
          statements: `
            INSERT INTO product_localizations (product_id, locale, name, description)
            VALUES (?, ?, ?, ?)
          `,
          values: [
            id,
            locale,
            product.name[locale] || product.name.default,
            product.description[locale] || product.description.default
          ]
        });
      }

      // 返回创建的产品
      return {
        id,
        name: product.name,
        description: product.description,
        price: product.price
      };
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }
}

// 导出默认实例
const sqliteClient = new SQLiteClient();
export default sqliteClient;