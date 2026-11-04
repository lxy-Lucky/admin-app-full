import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, Popover, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAuth, useLogout } from '@/features/auth'
import { LanguageSwitch, ThemeSwitch } from '@/shared/components'

export default function HeaderActions() {
  const { t } = useTranslation('layout')
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <Space size={12}>
      <LanguageSwitch />
      <Popover trigger="click" placement="bottomRight" content={<ThemeSwitch />}>
        <Button type="text" icon={<SettingOutlined />} aria-label={t('header.settings')} />
      </Popover>
      <Dropdown
        menu={{
          items: [
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: t('header.logout'),
              onClick: () => void logout(),
            },
          ],
        }}
      >
        <Space style={{ cursor: 'pointer' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          {user?.name}
        </Space>
      </Dropdown>
    </Space>
  )
}
