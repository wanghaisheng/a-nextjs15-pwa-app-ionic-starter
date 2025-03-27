
在 **Capacitor** 开发中，集成合适的插件可以快速实现核心功能（如相机、存储、推送等）。以下是 **常规 App 必须集成的基础插件** 和 **推荐场景插件**，分类整理如下：

---

### **1. 核心必备插件**
这些插件覆盖了大多数 App 的基础需求：

| **插件**                     | **功能**                     | **安装命令**                          |
|------------------------------|-----------------------------|---------------------------------------|
| **`@capacitor/app`**         | 管理 App 生命周期（前后台切换、退出等） | `npm install @capacitor/app`         |
| **`@capacitor/haptics`**     | 触觉反馈（振动）              | `npm install @capacitor/haptics`     |
| **`@capacitor/keyboard`**    | 键盘弹出/收起事件监听         | `npm install @capacitor/keyboard`    |
| **`@capacitor/status-bar`**  | 状态栏颜色和样式控制          | `npm install @capacitor/status-bar`  |
| **`@capacitor/splash-screen`** | 启动页控制（隐藏、延迟等）    | `npm install @capacitor/splash-screen` |

---

### **2. 设备功能插件**
访问手机硬件或系统功能：

| **插件**                     | **功能**                     | **安装命令**                          |
|------------------------------|-----------------------------|---------------------------------------|
| **`@capacitor/camera`**      | 拍照或选择相册图片           | `npm install @capacitor/camera`      |
| **`@capacitor/geolocation`** | 获取 GPS 位置                | `npm install @capacitor/geolocation` |
| **`@capacitor/filesystem`**  | 本地文件读写（如缓存、下载）  | `npm install @capacitor/filesystem`  |
| **`@capacitor/preferences`** | 本地键值存储（类似 localStorage） | `npm install @capacitor/preferences` |
| **`@capacitor/device`**      | 获取设备信息（型号、OS 版本等） | `npm install @capacitor/device`      |

---

### **3. 网络与通信插件**
| **插件**                     | **功能**                     | **安装命令**                          |
|------------------------------|-----------------------------|---------------------------------------|
| **`@capacitor/network`**     | 检测网络状态（在线/离线）     | `npm install @capacitor/network`     |
| **`@capacitor/share`**       | 调用系统分享功能              | `npm install @capacitor/share`       |
| **`@capacitor/http`**        | 原生 HTTP 请求（绕过 CORS）   | `npm install @capacitor/http`        |

---

### **4. 高级功能插件**
根据场景按需集成：

| **插件**                     | **功能**                     | **安装命令**                          |
|------------------------------|-----------------------------|---------------------------------------|
| **`@capacitor/push-notifications`** | 推送通知（需配置 Firebase/APNs） | `npm install @capacitor/push-notifications` |
| **`@capacitor/local-notifications`** | 本地通知（无需服务器）       | `npm install @capacitor/local-notifications` |
| **`@capacitor/apple-login`**  | 苹果账号登录（Sign in with Apple） | `npm install @capacitor/apple-login` |
| **`@capacitor/google-auth`**  | Google 登录                  | `npm install @capacitor/google-auth` |
| **`@capacitor/screen-reader`** | 屏幕阅读器（无障碍功能）      | `npm install @capacitor/screen-reader` |

---

### **5. 支付与商业化插件**
| **插件**                     | **功能**                     | **安装命令**                          |
|------------------------------|-----------------------------|---------------------------------------|
| **`capacitor-purchases`**    | 苹果内购/谷歌支付（RevenueCat 封装） | `npm install @revenuecat/purchases-capacitor` |
| **`capacitor-stripe`**       | Stripe 支付集成              | `npm install capacitor-stripe`       |

---

### **6. 企业级插件**
| **插件**                     | **功能**                     | **安装命令**                          |
|------------------------------|-----------------------------|---------------------------------------|
| **`@capacitor-community/sqlite`** | 本地 SQLite 数据库         | `npm install @capacitor-community/sqlite` |
| **`@capacitor-community/bluetooth-le`** | 蓝牙低功耗（BLE）通信 | `npm install @capacitor-community/bluetooth-le` |

---

### **7. 插件使用示例**
#### **相机插件示例**
```typescript
import { Camera } from '@capacitor/camera';

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    resultType: 'uri'
  });
  console.log('图片路径:', image.path);
};
```

#### **文件系统插件示例**
```typescript
import { Filesystem } from '@capacitor/filesystem';

const writeFile = async () => {
  await Filesystem.writeFile({
    path: 'text.txt',
    data: 'Hello World',
    directory: Directory.Documents
  });
};
```

#### **网络状态检测示例**
```typescript
import { Network } from '@capacitor/network';

const checkNetwork = async () => {
  const status = await Network.getStatus();
  console.log('网络状态:', status.connected ? '在线' : '离线');
};
```

---

### **8. 注意事项**
1. **平台兼容性**：部分插件仅支持 iOS/Android（如 `apple-login`），需检查文档。
2. **权限配置**：相机、GPS 等功能需在 `android/app/src/main/AndroidManifest.xml` 和 `ios/App/App/Info.plist` 中声明权限。
3. **插件更新**：定期运行 `npx cap update` 同步原生代码。

---

### **总结**
- **基础 App**：核心插件（App、Haptics、Camera、Filesystem） + 设备插件（Geolocation、Device）。
- **社交类**：分享插件（Share） + 登录插件（Google/Apple Auth）。
- **电商类**：支付插件（Purchases/Stripe） + 通知插件（Push Notifications）。

根据需求选择插件，避免过度集成！


如果你们在 **App Store 上架的 iOS 应用**中同时集成了 **RevenueCat（苹果内购 IAP）** 和 **Stripe（或其他第三方支付）**，**确实存在被苹果下架的风险**，但具体是否违规取决于支付的使用场景。以下是关键规则和应对策略：

---

### **1. 苹果的明确规则**
根据 [App Store 审核指南 3.1.1](https://developer.apple.com/app-store/review/guidelines/#payments)：
- **虚拟商品/数字服务**（如会员订阅、游戏货币、解锁功能）必须使用 **苹果内购（IAP）**，苹果抽成 15%~30%。  
- **实物商品/线下服务**（如电商商品、外卖、打车）允许使用第三方支付（如 Stripe）。  
- **违规后果**：苹果会拒绝审核或直接下架应用。

---

### **2. 允许同时集成的情况**
#### **✅ 合规场景（不会被下架）**
| **支付方式**       | **用途**                                                                 | 示例                          |
|--------------------|-------------------------------------------------------------------------|-------------------------------|
| **RevenueCat（IAP）** | 销售虚拟商品/数字内容（如 App 内会员、游戏道具）。                       | 解锁高级功能、月度订阅。        |
| **Stripe**         | 销售实物商品或线下服务（需提供真实物流或服务凭证）。                     | 网购衣服、预约家政服务。        |

#### **❌ 违规场景（高风险下架）**
| **行为**                                                                 | 苹果的处罚依据                     |
|--------------------------------------------------------------------------|-----------------------------------|
| 用 Stripe 销售虚拟商品（绕过 IAP）。                                      | 违反规则 3.1.1。                  |
| 在 App 内引导用户到网页支付（如弹窗提示“官网购买更便宜”）。               | 违反规则 3.1.3（禁止规避 IAP）。   |
| 同一功能既用 IAP 又用 Stripe 提供（如会员订阅两种支付方式）。             | 视为故意规避抽成。                |

---

### **3. 如何安全地同时集成？**
#### **策略 1：严格区分支付场景**
- **代码示例**（在支付前检查商品类型）：
  ```typescript
  function handlePayment(item: { type: 'virtual' | 'physical' }) {
    if (item.type === 'virtual') {
      // 必须走 IAP
      RevenueCat.purchase(productId);
    } else {
      // 实物走 Stripe
      Stripe.checkout(item.price);
    }
  }
  ```

#### **策略 2：隐藏 Web 支付入口（仅在 App 外可用）**
- **合规做法**：  
  - 在 App 内完全隐藏 Stripe 的虚拟商品支付选项。  
  - 仅通过 **邮件、短信或官网** 引导用户到 Web 端用 Stripe 支付（确保不触发 App 内跳转）。  

- **违规做法**：  
  ```typescript
  // 禁止在 App 内跳转 Web 支付页！
  if (isIOS) {
    window.open('https://your-website.com/pay'); // ❌ 会被苹果检测到
  }
  ```

#### **策略 3：后端统一权限管理**
- 无论用户通过 IAP 还是 Stripe（Web 端）支付，后端同步订阅状态：
  ```typescript
  // 后端 API 验证支付来源
  app.post('/api/grant-access', (req, res) => {
    if (req.body.paymentSource === 'iap') {
      verifyAppleReceipt(req.body.receipt); // 验证苹果收据
    } else if (req.body.paymentSource === 'stripe') {
      verifyStripePayment(req.body.paymentId); // 验证 Stripe Webhook
    }
    grantUserAccess(req.body.userId); // 统一开通权限
  });
  ```

---

### **4. 苹果审核的隐蔽检查**
- **自动化检测**：苹果会扫描 App 二进制文件中的支付相关关键字（如 `Stripe`、`PayPal`）。  
- **人工审核**：测试员会尝试购买虚拟商品，检查是否强制走 IAP。  
- **规避技巧**（谨慎使用）：  
  - 延迟加载 Stripe SDK（仅在非 iOS 平台或检测到实物商品时初始化）。  
  - 使用模糊的代码命名（如将 `Stripe.checkout` 改为 `PaymentService.start`）。  

---

### **5. 如果被拒绝/下架怎么办？**
1. **首次回应**：  
   - 声明 Stripe 仅用于实物商品（需提供截图或操作录屏证明）。  
2. **二次申诉**：  
   - 临时移除 Stripe 代码，重新提交审核后再灰度恢复。  
3. **长期方案**：  
   - 虚拟商品全走 IAP，Stripe 仅用于 Web 端或企业签名分发。  

---

### **6. 最佳实践总结**
| **目标**                | **合规方案**                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| 虚拟商品                | 100% 使用 RevenueCat（IAP），避免任何第三方支付入口。                        |
| 实物商品                | 使用 Stripe，且在 App 内明确标注“实物商品”（如商品详情页注明“含物流配送”）。 |
| 跨平台订阅同步          | 通过后端统一管理权限（不依赖前端支付方式）。                                 |
| 避免审核风险            | 提交审核时注释或移除 Stripe 的虚拟商品相关代码。                            |

---

### **最终结论**
- **可以同时集成**，但必须严格区分用途：  
  - **IAP 用于虚拟商品**（必须遵守）。  
  - **Stripe 用于实物商品**（需提供证明）。  
- **违规操作**会导致下架，务必在审核时隐藏敏感逻辑。  
- 如果利润敏感，考虑将虚拟商品支付完全放在 **PWA 或 Web 端**（避开 App Store 监管）。  

谨慎设计支付流程，平衡合规性和业务需求！