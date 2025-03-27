# Next.js 15 + Ionic + Tailwind + Capacitor 项目改造计划

本文档基于guideline.md中的规则集，详细说明项目改造计划，包括项目结构调整、国际化实现、数据演进策略、UI组件规范等方面。

## 1. 项目结构调整

### 1.1 目录结构重组

按照增强型目录结构规范，将现有项目重组为以下结构：

```
nextjs15-tailwind-ionic-capacitor-starter/
├── app/                      # Next.js App Router
│   ├── (mobile)/             # 移动端专属路由
│   ├── (web)/                # Web专属路由
│   └── api/                  # API路由
├── src/
│   ├── assets/               # 静态资源
│   │   ├── locales/          # 国际化资源文件
│   │   └── images/           # 图片资源
│   ├── core/                 # 跨平台核心
│   │   ├── components/       # 共享UI组件
│   │   ├── hooks/            # 共享Hooks
│   │   ├── lib/              # 核心库
│   │   │   ├── db/           # 数据库访问层
│   │   │   ├── i18n/         # 国际化核心
│   │   │   └── api/          # API客户端
│   │   └── models/           # 数据模型
│   ├── mobile/               # 移动端特定
│   │   ├── components/       # 原生增强组件
│   │   ├── plugins/          # Capacitor插件封装
│   │   └── utils/            # 移动端工具
│   ├── web/                  # Web特定
│   ├── providers/            # 全局Providers
│   ├── styles/               # 全局样式
│   └── utils/                # 通用工具
├── capacitor/                # 原生项目
│   ├── android/              # Android平台
│   └── ios/                  # iOS平台
├── scripts/                  # 构建/部署脚本
├── public/                   # 公共资源
└── test/                     # 测试代码
```

### 1.2 文件迁移计划

1. 将现有app目录下的组件迁移到src/core/components
2. 将现有app/hooks迁移到src/core/hooks
3. 将现有app/lib迁移到src/core/lib
4. 创建src/mobile目录，整合现有的移动端特定功能
5. 创建src/providers目录，实现全局Provider组件

## 2. 国际化(i18n)实现

### 2.1 国际化架构搭建

1. 安装next-international依赖
   ```bash
   npm install next-international
   ```

2. 创建国际化核心目录结构
   ```
   src/core/lib/i18n/
   ├── config.ts              # i18n配置
   ├── dictionaries/          # 翻译字典
   │   ├── en/
   │   │   ├── common.json    # 通用文本
   │   │   ├── auth.json      # 认证相关
   │   │   └── ...           # 按模块组织
   │   ├── zh/
   │   └── ...
   ├── hooks/                 # 国际化Hooks
   ├── providers/             # 国际化Providers
   └── types.ts               # 类型定义
   ```

3. 实现I18nProvider组件

### 2.2 数据国际化处理

1. 定义LocalizedString类型
2. 更新数据模型以支持多语言字段
3. 实现数据库层的国际化处理逻辑

## 3. 数据演进策略

### 3.1 数据库工厂实现

1. 创建数据库工厂，支持多种数据库引擎
   - Mock数据库（开发环境）
   - IndexedDB（Web环境）
   - SQLite（移动端环境）
   - 云端数据库（生产环境）

2. 实现平台感知的数据库选择逻辑

### 3.2 环境变量配置

1. 创建.env.example文件，包含所有必要的环境变量
2. 实现环境变量读取和验证逻辑

## 4. UI组件规范

### 4.1 混合UI组件架构

1. 创建组件目录结构
   ```
   src/core/components/
   ├── ui/                     # 纯Tailwind组件
   │   ├── Button.tsx
   │   └── Card.tsx
   ├── ionic/                  # Ionic组件封装
   │   ├── IonButton.tsx       # 带Tailwind样式的Ionic按钮
   │   └── IonCard.tsx
   └── hybrid/                 # 混合组件
       ├── AppHeader.tsx       # 自适应页头
       └── FormInput.tsx       # 平台感知输入框
   ```

2. 实现Ionic组件的Tailwind封装
3. 创建平台自适应组件

### 4.2 样式系统增强

1. 更新Tailwind配置
2. 添加国际化样式支持（RTL等）
3. 实现Ionic组件的样式覆盖

## 5. API路由国际化

### 5.1 国际化中间件

1. 实现语言检测和重定向中间件
2. 配置中间件匹配规则

### 5.2 国际化API响应

1. 实现API路由的语言感知逻辑
2. 创建本地化数据返回机制

## 6. Capacitor插件集成

### 6.1 蓝牙LE插件

1. 创建蓝牙服务封装
   ```
   src/mobile/plugins/bluetooth/
   ├── index.ts               # 导出接口
   ├── service.ts             # 服务实现
   ├── types.ts               # 类型定义
   └── web-fallback.ts        # Web环境回退实现
   ```

2. 实现国际化错误消息
3. 创建示例组件

### 6.2 SQLite插件

1. 创建SQLite数据库客户端
   ```
   src/core/lib/db/local/
   ├── sqlite.ts              # SQLite客户端实现
   ├── migrations/            # 数据库迁移脚本
   └── models/                # 数据模型映射
   ```

2. 实现数据同步机制
3. 添加加密支持

### 6.3 社交登录集成

1. 创建统一的认证服务
   ```
   src/core/lib/auth/
   ├── index.ts               # 导出接口
   ├── providers/             # 认证提供商
   │   ├── oauth.ts           # OAuth2实现
   │   ├── wechat.ts          # 微信登录
   │   └── alipay.ts          # 支付宝登录
   ├── phone-auth.ts          # 手机验证码登录
   └── types.ts               # 类型定义
   ```

2. 实现平台特定配置
3. 创建登录UI组件

## 7. 测试策略

### 7.1 国际化测试

1. 创建国际化测试工具
2. 实现组件国际化测试

### 7.2 数据库测试

1. 创建数据库测试辅助工具
2. 实现本地化数据测试

## 8. 构建与部署

### 8.1 构建脚本增强

1. 更新package.json构建脚本
2. 创建多语言静态生成脚本

### 8.2 移动端构建优化

1. 实现Android和iOS平台构建脚本
2. 添加国际化资源生成脚本

## 9. 性能优化

### 9.1 代码分割

1. 实现按语言代码分割
2. 创建LazyLocaleComponent组件

### 9.2 资源优化

1. 实现本地化图片组件
2. 优化国际化资源加载

## 10. 实施阶段

### 阶段一：基础架构调整（1-2周）

1. 项目结构重组
2. 国际化架构搭建
3. 数据库工厂实现

### 阶段二：核心功能实现（2-3周）

1. UI组件规范实现
2. API路由国际化
3. Capacitor插件集成

### 阶段三：优化完善（1-2周）

1. 测试策略实施
2. 构建与部署优化
3. 性能优化

## 11. 注意事项

1. 确保数据和页面分离，开发过程使用mockdata，生产环境方便api集成
2. 保持移动端和Web端的一致性体验
3. 优先实现核心功能，逐步添加增强特性
4. 定期进行性能测试和优化