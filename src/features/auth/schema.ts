import { z } from 'zod'

/**
 * 登录表单校验规则。
 *
 * 校验错误信息使用 auth:validation 命名空间下的 i18n Key，
 * 由表单错误展示层在渲染时进行国际化处理。
 */
export const loginSchema = z.object({
  /** 用户名：去除首尾空格后不能为空。 */
  username: z.string().trim().min(1, 'required'),
  /** 密码：不能为空，保留用户输入的原始内容。 */
  password: z.string().min(1, 'required'),
})

/** 根据登录 Schema 自动推导的表单数据类型。 */
export type LoginForm = z.infer<typeof loginSchema>
