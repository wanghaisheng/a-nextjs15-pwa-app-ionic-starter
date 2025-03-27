/**
 * 数据服务演示页面
 */
'use client';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import DataServiceDemo from '@/app/components/DataServiceDemo';
import { DataServiceProvider } from '@/app/services/data';

export default function DataServicePage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>数据服务演示</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1 className="text-2xl font-bold mb-4">数据服务层演示</h1>
        <p className="mb-4 text-gray-600">
          本页面展示了项目中实现的数据服务层架构，实现了数据和页面的分离。
          数据服务层封装了对数据库层的访问，提供统一的数据操作接口。
        </p>
        
        <DataServiceProvider>
          <DataServiceDemo />
        </DataServiceProvider>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-bold mb-2">数据服务层架构说明</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>统一接口</strong>: 所有环境实现相同的数据访问接口</li>
            <li><strong>环境隔离</strong>: 开发环境使用模拟数据，生产环境使用真实API</li>
            <li><strong>类型安全</strong>: 使用TypeScript确保类型安全和一致性</li>
            <li><strong>React集成</strong>: 通过Context和Hooks提供便捷的数据访问方式</li>
            <li><strong>错误处理</strong>: 统一的错误处理和日志记录机制</li>
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
}