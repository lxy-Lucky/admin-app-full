import type { ReactNode } from 'react'
import { useAuth } from '../hooks'

interface AuthProps {
  /** 必须拥有的权限码。 */
  code?: string
  /** 满足其中任意一个权限码即可通过。 */
  anyOf?: readonly string[]
  /** 必须同时拥有所有指定权限码。 */
  allOf?: readonly string[]
  /** 权限不足时展示的内容，默认为不渲染。 */
  fallback?: ReactNode
  /** 权限验证通过后展示的内容。 */
  children: ReactNode
}

/**
 * 操作级权限控制组件。
 *
 * 根据当前用户的权限决定是否渲染子组件，
 * 支持单个权限、任意权限和全部权限组合校验。
 *
 * 示例：
 * <Auth code="system:user:edit">
 *   <Button>编辑</Button>
 * </Auth>
 */
export default function Auth({ code, anyOf, allOf, fallback = null, children }: AuthProps) {
  const { can, canAny, canAll } = useAuth()
  const allowed = can(code) && (!anyOf || canAny(anyOf)) && (!allOf || canAll(allOf))
  return allowed ? children : fallback
}
