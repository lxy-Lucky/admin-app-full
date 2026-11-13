import { DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Dropdown, Popover, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAuth, useLogout } from '@/features/auth'
import { LanguageSwitch, ThemeSwitch } from '@/shared/components'

export default function HeaderActions() {
  const { t } = useTranslation('layout')
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <Space size={16}>
      {/* 语言切换 */}
      <LanguageSwitch />

      {/* 主题设置 */}
      <Popover trigger="click" placement="bottomRight" content={<ThemeSwitch />}>
        <Button
          type="text"
          icon={<SettingOutlined />}
          aria-label={t('header.settings')}
          style={{ color: 'inherit' }}
        />
      </Popover>

      {/* 用户菜单 */}
      <Dropdown
        menu={{
          items: [
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: t('header.logout'),
              // 使用 void 忽略异步函数的返回值
              onClick: () => void logout(),
            },
          ],
        }}
      >
        <Space size={8} style={{ cursor: 'pointer' }}>
          {user?.name}
          <DownOutlined style={{ fontSize: 12 }} />
        </Space>
      </Dropdown>
    </Space>
  )
}
