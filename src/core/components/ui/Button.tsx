/**
 * 纯Tailwind按钮组件
 */
import { twMerge } from 'tailwind-merge'
import { useI18n } from '@/core/lib/i18n/config'

type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const t = useI18n()
  
  const baseStyles = 'font-medium rounded-lg focus:outline-none'
  
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  
  const sizeStyles = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  }
  
  return (
    <button
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? t(children) : children}
    </button>
  )
}