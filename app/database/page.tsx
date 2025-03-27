/**
 * 数据库演示页面
 */
'use client';

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import DatabaseDemo from '@/app/components/DatabaseDemo';

export default function DatabasePage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>数据库演示</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1 className="text-2xl font-bold mb-4">数据库层演示</h1>
        <p className="mb-4 text-gray-600">
          本页面展示了项目中实现的数据库层架构，包括Mock数据、本地数据库和云端数据库三种环境。
          可以通过环境变量 <code>NEXT_PUBLIC_DATABASE_ENV</code> 切换不同的数据库实现。
        </p>
        
        <DatabaseDemo />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-bold mb-2">数据库层架构说明</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>统一接口</strong>: 所有环境实现相同的 <code>DatabaseClient</code> 接口</li>
            <li><strong>Mock环境</strong>: 使用内存数据结构，适合开发和测试</li>
            <li><strong>本地环境</strong>: 使用IndexedDB存储数据，适合PWA应用</li>
            <li><strong>云端环境</strong>: 模拟与远程API交互，适合生产环境</li>
            <li><strong>环境切换</strong>: 通过环境变量无缝切换不同实现</li>
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
}