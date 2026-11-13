import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Form, Input } from 'antd'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormField, LanguageSwitch } from '@/shared/components'
import { env } from '@/shared/config/env'
import { useLogin } from '../hooks'
import { loginSchema, type LoginForm } from '../schema'
import styles from './LoginPage.module.scss'

/**
 * 登录页面。
 *
 * 使用 React Hook Form 管理表单状态，并通过 Zod Schema 校验输入，
 * 提交后调用登录 Mutation 完成身份认证。
 * 同时提供语言切换和开发环境下的 Mock 提示。
 */
export default function LoginPage() {
  const { t } = useTranslation('auth')
  const login = useLogin()
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: 'admin', password: 'admin123' },
  })

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.lang}>
          <LanguageSwitch />
        </div>
        <div className={styles.head}>
          <h1>{env.VITE_APP_TITLE}</h1>
          <p>{t('login.subtitle')}</p>
        </div>
        <Form
          className={styles.form}
          layout="vertical"
          onFinish={() => void handleSubmit((v) => login.mutate(v))()}
        >
          {import.meta.env.DEV && env.VITE_USE_MOCK && (
            <Alert type="info" showIcon title={t('login.mockHint')} style={{ marginBottom: 24 }} />
          )}
          <FormField control={control} name="username" label={t('login.username')}>
            {(field) => (
              <Input
                {...field}
                autoComplete="username"
                placeholder={t('login.usernamePlaceholder')}
              />
            )}
          </FormField>
          <FormField control={control} name="password" label={t('login.password')}>
            {(field) => (
              <Input.Password
                {...field}
                autoComplete="current-password"
                placeholder={t('login.passwordPlaceholder')}
              />
            )}
          </FormField>
          <Button
            className={styles.submit}
            type="primary"
            htmlType="submit"
            block
            loading={login.isPending}
          >
            {t('login.submit')}
          </Button>
        </Form>
      </div>
    </div>
  )
}
