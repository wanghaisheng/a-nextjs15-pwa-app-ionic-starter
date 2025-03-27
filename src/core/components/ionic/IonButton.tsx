/**
 * Ionic按钮组件封装
 * 添加Tailwind样式和国际化支持
 */
import { IonButton as NativeIonButton } from '@ionic/react'
import { twMerge } from 'tailwind-merge'
import { useI18n } from '@/core/lib/i18n/config'

export function IonButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NativeIonButton>) {
  const t = useI18n()
  
  return (
    <NativeIonButton
      className={twMerge(
        'font-medium rounded-lg shadow-sm',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? t(children) : children}
    </NativeIonButton>
  )
}