/**
 * Ionic页头组件封装
 * 添加Tailwind样式和国际化支持
 * 用于移动端平台
 */
import { IonHeader as NativeIonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react'
import { twMerge } from 'tailwind-merge'
import { useI18n } from '@/core/lib/i18n/config'

type IonHeaderProps = {
  title: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  showBackButton?: boolean
  className?: string
}

export function IonHeader({
  title,
  leftAction,
  rightAction,
  showBackButton = false,
  className,
  ...props
}: IonHeaderProps & Omit<React.ComponentProps<typeof NativeIonHeader>, 'title'>) {
  const t = useI18n()
  
  return (
    <NativeIonHeader
      className={twMerge(
        'border-b border-gray-200',
        className
      )}
      {...props}
    >
      <IonToolbar>
        {(showBackButton || leftAction) && (
          <IonButtons slot="start">
            {showBackButton && <IonBackButton defaultHref="/" />}
            {leftAction}
          </IonButtons>
        )}
        
        <IonTitle>
          {typeof title === 'string' ? t(title) : title}
        </IonTitle>
        
        {rightAction && (
          <IonButtons slot="end">
            {rightAction}
          </IonButtons>
        )}
      </IonToolbar>
    </NativeIonHeader>
  )
}