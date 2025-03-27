/**
 * Header组件示例页面
 */
import dynamic from 'next/dynamic'

// 使用动态导入避免SSR问题
const HeaderDemo = dynamic(
  () => import('@/app/components/HeaderDemo'),
  { ssr: false }
)

export default function HeaderDemoPage() {
  return <HeaderDemo />
}