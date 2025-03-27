/**
 * 统一认证服务实现
 * 提供多种登录方式的统一接口
 */
import { Capacitor } from '@capacitor/core';
import { AuthConfig, AuthState, LoginResult, VerificationCodeResult, UserInfo, AuthProvider } from './types';

/**
 * 认证服务类
 */
export class AuthService {
  private isInitialized = false;
  private config: AuthConfig;
  private authState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  };
  private stateListeners: ((state: AuthState) => void)[] = [];

  constructor(config: AuthConfig = {}) {
    this.config = {
      debug: config.debug || false,
      providers: config.providers || ['oauth', 'phone'],
      oauthConfig: config.oauthConfig,
      wechatConfig: config.wechatConfig,
      alipayConfig: config.alipayConfig,
      phoneConfig: config.phoneConfig
    };
  }

  /**
   * 初始化认证服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 从本地存储加载认证状态
      await this.loadAuthState();

      // 检查令牌是否过期
      if (this.authState.user?.expiresAt && this.authState.user.expiresAt < Date.now()) {
        // 尝试刷新令牌
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          // 刷新失败，清除认证状态
          await this.clearAuthState();
        }
      }

      this.isInitialized = true;
      this.updateAuthState({ isLoading: false });

      if (this.config.debug) {
        console.log('Auth service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Auth service:', error);
      this.updateAuthState({
        isLoading: false,
        error: 'Failed to initialize authentication'
      });
      throw error;
    }
  }

  /**
   * 获取当前认证状态
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * 添加状态监听器
   */
  public addStateListener(listener: (state: AuthState) => void): void {
    this.stateListeners.push(listener);