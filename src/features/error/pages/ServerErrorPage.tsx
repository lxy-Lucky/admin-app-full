import { useRouteError } from 'react-router'
import { ResultPage } from '@/shared/components'

/**
 * 服务端错误页面。
 *
 * 同时用于独立的 /500 路由和 React Router 的 errorElement，
 * 开发环境下展示路由错误详情，生产环境仅展示通用错误页面。
 */
export default function ServerErrorPage() {
  const error = useRouteError()
  const detail = import.meta.env.DEV && error ? String(error) : undefined
  return <ResultPage status="500" detail={detail} />
}
