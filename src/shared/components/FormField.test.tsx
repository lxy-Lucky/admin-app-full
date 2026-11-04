import { zodResolver } from '@hookform/resolvers/zod'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, Input } from 'antd'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import i18n, { changeLanguage } from '@/locales'
import FormField from './FormField'

const schema = z.object({
  name: z.string().min(1, 'required'),
  email: z.string().pipe(z.email('email')),
  note: z.string().min(1, 'Custom plain message'),
})

function Demo({ onValid }: { onValid: () => void }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', note: '' },
  })
  return (
    <Form onFinish={() => void handleSubmit(onValid)()}>
      <FormField control={control} name="name" label="Name" required>
        {(field) => <Input {...field} />}
      </FormField>
      <FormField control={control} name="email" label="Email">
        {(field) => <Input {...field} />}
      </FormField>
      <FormField control={control} name="note" label="Note">
        {(field) => <Input {...field} />}
      </FormField>
      <button type="submit">go</button>
    </Form>
  )
}

afterEach(async () => {
  await act(() => changeLanguage('zh-CN'))
})

describe('FormField', () => {
  it('links the label, shows translated Zod keys and passes plain messages through', async () => {
    const onValid = vi.fn()
    render(<Demo onValid={onValid} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'go' }))
    expect(await screen.findByText('此项必填')).toBeInTheDocument()
    expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument()
    expect(screen.getByText('Custom plain message')).toBeInTheDocument()
    expect(onValid).not.toHaveBeenCalled()
  })

  it('re-translates errors when the language changes', async () => {
    render(<Demo onValid={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'go' }))
    await screen.findByText('此项必填')
    await act(() => changeLanguage('en-US'))
    expect(await screen.findByText('This field is required')).toBeInTheDocument()
    expect(i18n.language).toBe('en-US')
  })

  it('submits when valid', async () => {
    const onValid = vi.fn()
    render(<Demo onValid={onValid} />)
    await userEvent.type(screen.getByLabelText('Name'), 'a')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('Note'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'go' }))
    await vi.waitFor(() => expect(onValid).toHaveBeenCalled())
  })
})
