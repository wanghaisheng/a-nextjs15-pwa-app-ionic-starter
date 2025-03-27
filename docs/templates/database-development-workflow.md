# 数据库开发工作流程

本文档详细说明了从Mock数据到本地数据库再到生产环境数据库的渐进式开发流程，确保数据结构在各环境中保持一致性。

## 1. 开发流程概述

数据库开发遵循以下三个阶段的渐进式流程：

1. **Mock数据阶段**：快速原型验证，无需真实数据库
2. **本地数据库阶段**：在开发环境中使用真实数据库
3. **生产环境数据库阶段**：最终部署到生产环境

## 2. Mock数据阶段

### 2.1 目的

- 快速验证业务逻辑和UI交互
- 无需配置真实数据库
- 便于前端开发并行工作

### 2.2 实现步骤

1. 在`src/mock/data/`目录下创建对应功能的mock数据文件

```typescript
// src/mock/data/[feature-name].ts
export const mockData = {
  // 定义与实际数据结构一致的Mock数据
};
```

2. 创建Mock数据服务

```typescript
// src/core/lib/db/mock/[service-name].ts
import { mockData } from '@/mock/data/[feature-name]';

export class MockService implements ServiceInterface {
  // 实现与真实服务相同的接口
}
```

3. 在`.env.local`中配置使用Mock数据

```
NEXT_PUBLIC_DATABASE_ENV=mock
NEXT_PUBLIC_MOCK_DB_TYPE=memory  # 或 json
```

### 2.3 验收标准

- Mock数据结构应与最终数据库结构保持一致
- 所有UI交互和业务逻辑可以通过Mock数据正常工作
- 完成相关单元测试

## 3. 本地数据库阶段

### 3.1 目的

- 验证真实数据库交互
- 测试数据持久化
- 验证数据库查询性能

### 3.2 实现步骤

1. 设计数据模型

```typescript
// src/core/lib/db/models/[model-name].ts
export interface ModelName {
  // 定义与Mock数据结构一致的数据模型
}
```

2. 创建数据库迁移脚本

```typescript
// src/core/lib/db/local/migrations/[timestamp]_create_[table_name].ts
export const up = async (db) => {
  // 创建表结构，确保与数据模型一致
};

export const down = async (db) => {
  // 回滚表结构
};
```

3. 实现数据库服务

```typescript
// src/core/lib/db/local/[service-name].ts
export class LocalDbService implements ServiceInterface {
  // 实现与Mock服务相同的接口，但使用真实数据库
}
```

4. 在`.env.local`中配置使用本地数据库

```
NEXT_PUBLIC_DATABASE_ENV=local
NEXT_PUBLIC_LOCAL_DB_TYPE=indexeddb  # 或 sqlite
```

### 3.3 验收标准

- 数据可以正确持久化到本地数据库
- 所有查询和业务逻辑在真实数据库环境中正常工作
- 数据库迁移脚本可以正确执行
- 完成集成测试

## 4. 生产环境数据库阶段

### 4.1 目的

- 准备生产环境部署
- 优化数据库性能
- 确保数据安全

### 4.2 实现步骤

1. 创建生产环境数据库SQL脚本

```sql
-- db/migrations/[timestamp]_create_[table_name].sql
CREATE TABLE table_name (
  -- 定义与本地数据库一致的表结构
);

-- 创建索引
CREATE INDEX idx_name ON table_name(column_name);
```

2. 实现云端数据库服务

```typescript
// src/core/lib/db/cloud/[service-name].ts
export class CloudDbService implements ServiceInterface {
  // 实现与本地数据库服务相同的接口，但连接到云端数据库
}
```

3. 在`.env.production`中配置使用云端数据库

```
NEXT_PUBLIC_DATABASE_ENV=cloud
NEXT_PUBLIC_CLOUD_DB_TYPE=supabase  # 或 mysql, cloudflare_d1
```

### 4.3 验收标准

- 生产环境数据库脚本可以正确执行
- 数据库性能满足需求
- 数据安全措施到位
- 完成性能测试和安全测试

## 5. 数据库工厂实现

为了实现不同环境间的无缝切换，使用数据库工厂模式：

```typescript
// src/core/lib/db/factory.ts
import { Capacitor } from '@capacitor/core';

export function createDatabaseClient(config) {
  const { databaseEnv, localDbType, cloudDbType, mockDbType } = config;
  
  // 根据环境和平台选择合适的数据库实现
  switch (databaseEnv) {
    case 'mock':
      return createMockDatabase(mockDbType);
    case 'local':
      // 移动端优先使用SQLite
      if (Capacitor.isNativePlatform() && localDbType === 'indexeddb') {
        return createLocalDatabase('sqlite');
      }
      return createLocalDatabase(localDbType);
    case 'cloud':
      return createCloudDatabase(cloudDbType);
    default:
      throw new Error(`Unsupported database environment: ${databaseEnv}`);
  }
}
```

## 6. 数据同步策略

对于需要在线离线都能工作的应用，实现数据同步策略：

```typescript
// src/core/lib/db/sync/sync-service.ts
export class DataSyncService {
  // 实现本地数据和云端数据的同步逻辑
  async syncData() {
    // 1. 获取上次同步时间
    // 2. 从云端获取新数据
    // 3. 将本地新数据上传到云端
    // 4. 解决冲突
    // 5. 更新同步时间
  }
}
```

## 7. 最佳实践

1. **保持一致性**：确保所有环境中的数据结构保持一致
2. **版本控制**：使用迁移脚本管理数据库版本
3. **类型安全**：使用TypeScript接口确保类型安全
4. **测试覆盖**：为每个环境编写测试
5. **错误处理**：实现健壮的错误处理机制
6. **性能优化**：根据实际使用情况添加索引和优化查询
7. **安全性**：实施适当的安全措施，如数据加密和访问控制

## 8. 开发流程检查清单

### Mock数据阶段
- [ ] 创建Mock数据结构
- [ ] 实现Mock服务
- [ ] 验证UI和业务逻辑
- [ ] 编写单元测试

### 本地数据库阶段
- [ ] 设计数据模型
- [ ] 创建迁移脚本
- [ ] 实现本地数据库服务
- [ ] 验证数据持久化
- [ ] 编写集成测试

### 生产环境数据库阶段
- [ ] 创建生产环境SQL脚本
- [ ] 实现云端数据库服务
- [ ] 优化性能和安全性
- [ ] 编写性能测试
- [ ] 更新文档