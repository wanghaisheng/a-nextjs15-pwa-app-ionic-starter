/**
 * 纯Tailwind页头组件
 * 用于Web平台
 */
import { twMerge } from 'tailwind-merge'
import { useI18n } from '@/core/lib/i18n/config'
import { Button } from './Button'

type HeaderProps = {
  title: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  className?: string
}

export function Header({
  title,
  leftAction,
  rightAction,
  className,
  ...props
}: HeaderProps & React.HTMLAttributes<HTMLDivElement>) {
  const t = useI18n()
  
  return (
    <header
      className={twMerge(
        'flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200',
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        {leftAction}
      </div>
      
      <h1 className="text-lg font-semibold text-gray-900">
        {typeof title === 'string' ? t(title) : title}
      </h1>
      
      <div className="flex items-center">
        {rightAction}
      </div>
    </header>
  )
}