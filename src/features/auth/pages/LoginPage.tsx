import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Card, Form, Input } from 'antd'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormField, LanguageSwitch } from '@/shared/components'
import { env } from '@/shared/config/env'
import { useLogin } from '../hooks'
import { loginSchema, type LoginForm } from '../schema'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const login = useLogin()
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <Card title={t('login.title')} extra={<LanguageSwitch />} style={{ width: 380 }}>
        {import.meta.env.DEV && env.VITE_USE_MOCK && (
          <Alert type="info" showIcon title={t('login.mockHint')} style={{ marginBottom: 16 }} />
        )}
        <Form layout="vertical" onFinish={() => void handleSubmit((v) => login.mutate(v))()}>
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
          <Button type="primary" htmlType="submit" block loading={login.isPending}>
            {t('login.submit')}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
