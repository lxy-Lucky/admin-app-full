import { LeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import styles from './BasicLayout.module.scss'
import LayoutBreadcrumb from './LayoutBreadcrumb'

const HOME_PATH = '/dashboard'

/**
 * 子导航栏
 *
 * 包含页面返回按钮和面包屑导航。
 * 首页隐藏返回按钮。
 */
export default function SubHeader() {
  const { t } = useTranslation('layout')
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={styles.subHeader}>
      {pathname !== HOME_PATH && (
        <Button
          type="link"
          size="small"
          icon={<LeftOutlined />}
          style={{ padding: 0 }}
          onClick={() => void navigate(-1)}
        >
          {t('header.back')}
        </Button>
      )}
      <LayoutBreadcrumb />
    </div>
  )
}
