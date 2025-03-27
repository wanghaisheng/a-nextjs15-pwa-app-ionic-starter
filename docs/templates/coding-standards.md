# 编码规范与最佳实践

本文档定义了项目的编码规范和最佳实践，确保团队成员在开发过程中遵循一致的编码风格，提高代码质量和可维护性。

## 1. 通用规范

### 1.1 文件命名

- **组件文件**：使用PascalCase，例如`Button.tsx`、`UserProfile.tsx`
- **工具/服务文件**：使用kebab-case，例如`auth-service.ts`、`date-utils.ts`
- **样式文件**：与对应组件同名，例如`Button.module.css`
- **测试文件**：添加`.test`或`.spec`后缀，例如`Button.test.tsx`

### 1.2 目录命名

- 使用kebab-case，例如`core/components/`、`mobile/plugins/`
- 目录名应清晰表达其包含内容的用途

### 1.3 代码格式化

- 使用项目配置的ESLint和Prettier规则
- 缩进使用2个空格
- 行尾不留空格
- 文件末尾保留一个空行

### 1.4 导入顺序

```typescript
// 1. React/Next.js导入
import React, { useState } from 'react';
import { useRouter } from 'next/router';

// 2. 第三方库导入
import { IonButton } from '@ionic/react';
import clsx from 'clsx';

// 3. 项目内导入（按路径长度排序）
import { useI18n } from '@/core/lib/i18n/config';
import { Button } from '@/core/components/ui/Button';
import { formatDate } from '@/utils/date-utils';

// 4. 类型导入
import type { User } from '@/core/models/user';

// 5. 样式导入
import styles from './Component.module.css';
```

## 2. TypeScript规范

### 2.1 类型定义

- 优先使用接口（interface）定义对象类型
- 使用类型别名（type）定义联合类型和工具类型
- 导出所有公共类型，便于复用

```typescript
// 推荐
export interface User {
  id: string;
  name: string;
  email: string;
}

// 联合类型使用type
export type Status = 'idle' | 'loading' | 'success' | 'error';
```

### 2.2 类型注解

- 函数参数和返回值必须有类型注解
- 变量声明尽量使用类型推断，避免冗余注解
- 使用泛型增强代码复用性和类型安全性

```typescript
// 推荐
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}

// 使用类型推断
const user = { id: '1', name: 'John' }; // 不需要显式注解
```

### 2.3 空值处理

- 明确区分`undefined`和`null`的使用场景
- 使用可选链（?.）和空值合并（??）操作符
- 避免使用非空断言（!），除非确实必要

```typescript
// 推荐
const userName = user?.name ?? 'Guest';

// 避免
const userName = user!.name;
```

## 3. React/Next.js规范

### 3.1 组件定义

- 使用函数组件和Hooks
- 组件文件只导出一个主组件
- 小型辅助组件可以在同一文件中定义

```typescript
// 推荐
export function Button({ children, ...props }: ButtonProps) {
  // 组件实现
  return <button {...props}>{children}</button>;
}
```

### 3.2 Props定义

- 使用接口定义Props类型
- 为可选Props提供默认值
- 使用解构赋值获取Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  // 组件实现
}
```

### 3.3 Hooks使用

- 遵循Hooks规则（只在顶层调用，只在函数组件中调用）
- 自定义Hooks名称以`use`开头
- 相关逻辑抽取为自定义Hooks

```typescript
// 推荐
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // 实现逻辑
    return initialValue;
  });
  
  // 更多实现...
  
  return [storedValue, setStoredValue];
}
```

### 3.4 状态管理

- 局部状态使用`useState`和`useReducer`
- 跨组件状态使用Zustand
- 避免过度使用全局状态

```typescript
// 局部状态
const [count, setCount] = useState(0);

// 复杂局部状态
const [state, dispatch] = useReducer(reducer, initialState);

// 全局状态
const useStore = create<StoreState>((set) => ({
  // 状态定义
}));
```

## 4. 移动端开发规范

### 4.1 Capacitor插件使用

- 所有插件调用封装在服务层
- 提供Web环境的回退实现
- 使用平台检测确定可用功能

```typescript
import { Capacitor } from '@capacitor/core';

export function getBluetoothService() {
  if (Capacitor.isNativePlatform()) {
    return new NativeBluetoothService();
  }
  return new WebBluetoothService();
}
```

### 4.2 响应式设计

- 使用相对单位（rem, em）而非固定像素
- 使用Flexbox和Grid进行布局
- 使用媒体查询适配不同屏幕尺寸

```css
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}
```

## 5. 国际化规范

### 5.1 文本管理

- 所有用户可见文本使用国际化函数
- 按模块组织翻译文件
- 使用命名空间避免键名冲突

```typescript
// 推荐
const t = useI18n();
return <button>{t('buttons.submit')}</button>;

// 避免
return <button>Submit</button>;
```

### 5.2 日期和数字格式化

- 使用国际化API格式化日期和数字
- 考虑不同地区的格式差异

```typescript
const formatCurrency = (value: number, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
```

## 6. 测试规范

### 6.1 单元测试

- 每个组件和工具函数都应有单元测试
- 测试文件与源文件放在同一目录
- 使用Jest和React Testing Library

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### 6.2 集成测试

- 测试组件间交互
- 测试数据流和状态变化
- 模拟API请求和响应

### 6.3 端到端测试

- 使用Cypress或Playwright
- 测试关键用户流程
- 包括移动端和桌面端场景

## 7. 性能优化规范

### 7.1 组件优化

- 使用`React.memo`避免不必要的重渲染
- 使用`useMemo`和`useCallback`缓存计算结果和回调函数
- 使用虚拟列表渲染长列表

```typescript
// 推荐
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

### 7.2 图片优化

- 使用Next.js Image组件
- 提供适当的图片尺寸和格式
- 使用懒加载技术

```typescript
import Image from 'next/image';

<Image
  src="/images/profile.jpg"
  alt="Profile"
  width={500}
  height={300}
  loading="lazy"
/>
```

## 8. 安全规范

### 8.1 数据处理

- 敏感数据不存储在前端
- 使用HTTPS进行数据传输
- 实施适当的数据验证和清理

### 8.2 认证和授权

- 使用安全的认证方法
- 实施适当的授权检查
- 防止CSRF和XSS攻击

## 9. 文档规范

### 9.1 代码注释

- 复杂逻辑需要添加注释
- 使用JSDoc格式为函数和类型添加文档
- 注释应解释"为什么