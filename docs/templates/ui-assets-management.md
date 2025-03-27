# UI素材管理指南

本文档提供了项目中UI设计稿素材管理的最佳实践，特别是关于图标和图片资源的处理流程。

## 1. 素材管理流程

### 1.1 素材需求收集

当收到UI设计稿或需求文档时，应遵循以下步骤：

1. **素材清单整理**：
   - 识别设计稿中所有图标、图片等素材资源
   - 为每个素材资源分配唯一标识符（文件名）
   - 记录素材的尺寸、格式和用途

2. **素材分类**：
   - **图标类**：界面交互元素，如按钮图标、导航图标等
   - **插图类**：装饰性图片，如空状态插图、引导页插图等
   - **照片类**：内容展示图片，如产品图片、背景图等
   - **动画类**：需要动效的图片资源

3. **素材优先级划分**：
   - P0：核心功能必需的素材（如主导航图标）
   - P1：重要但非立即必需的素材（如次要功能图标）
   - P2：增强用户体验的素材（如装饰性插图）

### 1.2 开发阶段素材处理

在开发过程中，当设计素材尚未最终确定或提供时：

1. **使用SVG临时替代**：
   - 为所有缺失的图标/图片创建临时SVG替代品
   - 使用简单的几何形状或线条表示图标的大致形状和功能
   - 为SVG添加适当的注释，标明这是临时素材

2. **SVG命名规范**：
   - 使用与最终素材相同的文件名，添加`-temp`后缀
   - 例如：`home-icon-temp.svg`、`profile-banner-temp.svg`

3. **SVG存放位置**：
   - 临时SVG存放在`src/assets/images/temp/`目录下
   - 按功能模块或页面分子目录组织

### 1.3 素材资源CSV管理

为了便于后续生成真实素材，需创建并维护素材资源CSV文件：

1. **CSV文件结构**：
   - 位置：`docs/assets/assets-inventory.csv`
   - 包含以下字段：
     - `file_name`：素材文件名（不含扩展名）
     - `type`：素材类型（icon/illustration/photo/animation）
     - `size`：建议尺寸（宽x高，如24x24）
     - `format`：目标格式（svg/png/jpg/webp）
     - `description`：素材描述和用途
     - `location`：使用位置（页面/组件）
     - `priority`：优先级（P0/P1/P2）
     - `status`：状态（pending/temp/final）
     - `midjourney_prompt`：生成素材的提示词

2. **CSV示例**：
```csv
file_name,type,size,format,description,location,priority,status,midjourney_prompt
home-icon,icon,24x24,svg,首页导航图标,底部导航栏,P0,temp,"minimalist home icon with simple lines, flat design, blue color scheme, tech style"
profile-avatar,illustration,120x120,png,默认用户头像,个人资料页,P1,pending,"abstract user avatar, geometric shapes, modern design, soft colors, professional look"
welcome-banner,photo,750x350,webp,欢迎页横幅图片,欢迎页,P1,pending,"futuristic tech interface with glowing elements, dark background with blue accents, abstract digital landscape"
```

## 2. SVG临时素材创建指南

### 2.1 基本原则

- **简洁明了**：使用最少的元素表达图标/图片的核心含义
- **语义化**：SVG应传达出最终素材的功能和用途
- **响应式**：确保SVG可以适应不同尺寸
- **可访问性**：添加适当的ARIA属性和标题

### 2.2 SVG模板示例

#### 图标类SVG模板
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 临时首页图标 -->
  <title>首页图标</title>
  <rect x="4" y="10" width="16" height="10" stroke="currentColor" stroke-width="2" fill="none" />
  <path d="M4 10L12 3L20 10" stroke="currentColor" stroke-width="2" fill="none" />
  <!-- 注释：这是临时SVG，将被实际设计替换 -->
</svg>
```

#### 插图类SVG模板
```svg
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 临时空状态插图 -->
  <title>数据为空状态</title>
  <rect x="40" y="60" width="120" height="80" stroke="#CCCCCC" stroke-width="2" fill="none" />
  <circle cx="100" cy="100" r="30" stroke="#CCCCCC" stroke-width="2" fill="none" />
  <path d="M70 130L130 70" stroke="#CCCCCC" stroke-width="2" />
  <text x="100" y="160" text-anchor="middle" fill="#999999" font-size="12">暂无数据</text>
  <!-- 注释：这是临时SVG，将被实际设计替换 -->
</svg>
```

### 2.3 React组件封装

为了便于在代码中使用临时SVG，可以创建React组件：

```tsx
// src/core/components/ui/icons/TempIcon.tsx
import React from 'react';

interface TempIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const TempIcon: React.FC<TempIconProps> = ({ 
  name, 
  size = 24, 
  color = 'currentColor',
  className = ''
}) => {
  // 根据name返回不同的临时SVG
  switch (name) {
    case 'home':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="4" y="10" width="16" height="10" stroke={color} strokeWidth="2" fill="none" />
          <path d="M4 10L12 3L20 10" stroke={color} strokeWidth="2" fill="none" />
        </svg>
      );
    case 'user':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
          <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="2" fill="none" />
        </svg>
      );
    // 添加更多临时图标...
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth="2" fill="none" />
          <text x="12" y="14" textAnchor="middle" fill={color} fontSize="8">{name}</text>
        </svg>
      );
  }
};
```

## 3. Midjourney素材生成流程

### 3.1 提示词编写指南

为确保生成的素材符合项目风格，提示词应包含以下要素：

1. **素材类型描述**：明确指出是图标、插图还是照片
2. **风格定义**：指定设计风格（如扁平化、拟物化、线性等）
3. **色彩方案**：指定主色调或色彩风格
4. **情感基调**：描述素材应传达的情感或氛围
5. **技术细节**：指定分辨率、构图等技术要求

### 3.2 提示词模板

#### 图标类提示词模板
```
[icon type] icon in [style] style, [color scheme], [additional details], professional UI design, vector graphics, transparent background, [size]px
```

示例：
```
minimalist home icon in flat design style, blue and white color scheme, simple lines, professional UI design, vector graphics, transparent background, 24px
```

#### 插图类提示词模板
```
[illustration type] illustration for [purpose], [style] style, [color scheme], [mood/tone], [additional details], professional UI design, [composition]
```

示例：
```
abstract data visualization illustration for empty state, geometric style, blue and purple gradient, calm and professional mood, subtle grid background, professional UI design, centered composition
```

### 3.3 生成后处理

从Midjourney获取素材后，需进行以下处理：

1. **格式转换**：将生成的图片转换为项目所需格式（SVG/PNG/WebP）
2. **尺寸调整**：按照设计规范调整素材尺寸
3. **文件命名**：按照CSV中定义的文件名保存
4. **优化处理**：
   - 压缩图片大小
   - 优化SVG代码
   - 确保透明度正确

5. **替换临时素材**：
   - 将生成的素材放入正确的目录
   - 更新代码中的引用
   - 更新CSV文件中的状态为"final"

## 4. 素材管理最佳实践

### 4.1 版本控制

- 素材CSV文件应纳入版本控制
- 临时SVG应纳入版本控制
- 大型图片资源考虑使用Git LFS或外部存储

### 4.2 素材审核流程

1. **设计师审核**：确保生成的素材符合设计规范
2. **开发者验证**：确保素材在各种设备上显示正常
3. **性能检查**：确保素材不会影响应用性能

### 4.3 素材更新流程

当需要更新已有素材时：

1. 在CSV文件中标记需要更新的素材
2. 生成新的素材并进行处理
3. 使用新素材替换旧素材
4. 更新CSV文件中的相关信息

## 5. 常见问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| SVG在不同平台显示不一致 | 使用基本SVG元素，避免高级特性，确保viewBox设置正确 |
| 生成的素材风格不统一 | 创建详细的风格指南，在提示词中明确指定风格要素 |
| 素材文件过大 | 使用适当的压缩工具，考虑使用WebP格式，优化SVG代码 |
| 临时SVG与最终设计差异大 | 与设计师提前沟通，获取更详细的设计说明 |

## 6. 资源与工具

- [SVGO](https://github.com/svg/svgo) - SVG优化工具
- [Squoosh](https://squoosh.app/) - 图片压缩工具
- [Midjourney官方文档](https://docs.midjourney.com/) - AI图像生成指南
- [Figma to SVG插件](https://www.figma.com/community/plugin/814345141907543603/SVG-Export) - 从Figma导出SVG