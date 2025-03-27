/**
 * Header组件使用示例
 */
import { useState } from 'react'
import { IonContent, IonPage, IonButton, IonIcon } from '@ionic/react'
import { Header } from '@/src/core/components/Header'
import { menuOutline, notificationsOutline, settingsOutline } from 'ionicons/icons'

const HeaderDemo = () => {
  const [title, setTitle] = useState('header.title')
  
  // 切换标题示例
  const toggleTitle = () => {
    setTitle(title === 'header.title' ? 'header.alternate_title' : 'header.title')
  }
  
  return (
    <IonPage>
      <Header 
        title={title}
        leftAction={
          <IonButton fill="clear">
            <IonIcon slot="icon-only" icon={menuOutline} />
          </IonButton>
        }
        rightAction={
          <>
            <IonButton fill="clear">
              <IonIcon slot="icon-only" icon={notificationsOutline} />
            </IonButton>
            <IonButton fill="clear">
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </>
        }
      />
      
      <IonContent className="ion-padding">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">平台自适应Header组件示例</h2>
          <p className="text-gray-600">
            此组件会根据当前平台自动选择合适的实现：
            <ul className="list-disc pl-5 mt-2">
              <li>在Web平台使用纯Tailwind实现</li>
              <li>在移动端平台使用Ionic组件实现</li>
            </ul>
          </p>
          
          <div className="mt-4">
            <IonButton expand="block" onClick={toggleTitle}>
              切换标题
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default HeaderDemo