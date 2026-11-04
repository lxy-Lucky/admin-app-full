import { SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import type { Shortcut } from './shortcuts'

/** Quick entries on the dashboard. Keep in step with app/router/menu-routes.tsx. */
export const shortcuts: Shortcut[] = [
  {
    to: '/system/users',
    titleKey: 'menu.users',
    icon: <TeamOutlined />,
    permission: 'system:user:view',
  },
  {
    to: '/system/roles',
    titleKey: 'menu.roles',
    icon: <SafetyCertificateOutlined />,
    permission: 'system:role:view',
  },
]
