/**
 * 平台自适应页头组件
 * 根据平台自动选择Web或移动端实现
 */
import { Capacitor } from '@capacitor/core'
import { Header as WebHeader } from './ui/Header'
import { IonHeader as MobileHeader } from './ionic/IonHeader'

type HeaderProps = {
  title: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  showBackButton?: boolean
  className?: string
}

/**
 * 平台自适应页头组件
 * 在Web平台使用纯Tailwind实现
 * 在移动端平台使用Ionic组件实现
 */
export function Header(props: HeaderProps) {
  // 检测当前平台
  const isMobile = Capacitor.isNativePlatform()
  
  // 根据平台选择合适的实现
  if (isMobile) {
    return <MobileHeader {...props} />
  }
  
  // Web平台实现
  return <WebHeader {...props} />
}

// 导出子组件类型，方便使用
export type { HeaderProps }