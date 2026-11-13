# Admin App

React 1登录9 + TypeScript + Vite 企业级后台前端基础模板：布局、与权限、路由守卫、统一请求与错误处理、国际化、主题、通用表格/表单、Mock、Dashboard，以及代码规范与测试环境。

## 技术栈

| 领域   | 选型                                                            |
| ------ | --------------------------------------------------------------- |
| 基础   | React 19、TypeScript（strict）、Vite                            |
| UI     | Ant Design 6、@ant-design/icons                                 |
| 路由   | React Router（`createBrowserRouter`，页面懒加载）               |
| 请求   | Axios（单实例）、TanStack Query                                 |
| 状态   | Zustand（登录态、主题、语言、布局，均持久化）                   |
| 表单   | React Hook Form + Zod                                           |
| 国际化 | i18next + react-i18next（zh-CN / en-US / ja-JP）、Day.js        |
| 样式   | Sass + CSS Modules，主题色通过 CSS 变量同步                     |
| 规范   | ESLint（flat config）、Prettier、Husky、lint-staged、commitlint |
| 测试   | Vitest、Testing Library、MSW                                    |

## 快速开始

需要 Node 22（见 `.nvmrc`）和 pnpm ≥ 9。

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

开发环境默认开启 Mock（`.env.development` 中 `VITE_USE_MOCK=true`），登录页会显示可用账号：

| 账号   | 密码      | 权限                       |
| ------ | --------- | -------------------------- |
| admin  | admin123  | 全部                       |
| editor | editor123 | 用户管理：查看、新增、编辑 |
| viewer | viewer123 | 角色管理：查看             |

| 脚本                 | 说明                                   |
| -------------------- | -------------------------------------- |
| `pnpm dev`           | 开发服务器                             |
| `pnpm build`         | 类型检查 + 生产构建                    |
| `pnpm typecheck`     | 仅类型检查                             |
| `pnpm lint`          | ESLint（`lint:fix` 自动修复）          |
| `pnpm format`        | Prettier 格式化（`format:check` 校验） |
| `pnpm test`          | 运行单元/集成测试                      |
| `pnpm test:coverage` | 测试 + 覆盖率（输出到 `coverage/`）    |

## 目录结构

```
src/
├─ app/                 应用装配：providers、路由、布局、请求接线
│  ├─ layouts/          BasicLayout（侧边栏 / 顶栏 / 面包屑 / 内容区）
│  └─ router/           menu-routes.tsx（页面与菜单的唯一配置）、routes.tsx、guards.tsx
├─ features/            业务模块：auth、dashboard、system、error
│  └─ <module>/         api.ts  keys.ts  hooks.ts  schema.ts  types.ts  components/  pages/
├─ shared/              与业务无关的复用代码
│  ├─ components/       DataTable、FormField、FormModal、ConfirmAction、ResultPage ...
│  ├─ hooks/            useTable
│  ├─ request/          axios 实例、拦截器、ApiError、query-client、query key 工厂
│  ├─ config/           环境变量（Zod 校验）
│  ├─ types/  utils/
├─ locales/             <语言>/<命名空间>.json，自动加载
├─ theme/               主题配置、store、CSS 变量同步
├─ mocks/               MSW handlers 与内存数据（仅开发环境）
├─ styles/              全局样式、Sass 变量
└─ test/                测试 setup
```

依赖方向：`app → features → shared`。`shared` 不引用 `features` / `app`；`features` 之间只通过对方的 `index.ts` 引用。`mocks` 仅为类型引用 `features`。

## 约定

- **后端响应**：`{ code, data, msg }`，`code === 0` 为成功。业务错误返回 HTTP 200 + 非 0 `code`；未登录 HTTP 401（或 `code: 401`）；无权限 HTTP 403。约定不同时修改 `shared/request/config.ts` 和拦截器。
- **请求错误**：统一抛 `ApiError`（`kind`: `network | timeout | http | business | auth`），默认弹出错误提示；单个请求传 `{ silent: true }` 可静默。401 会清空登录态，`AuthGuard` 跳转 `/login` 并记住原页面。
- **权限码**：形如 `system:user:view`，`*` 表示全部；由登录接口返回。路由用 `permission` 声明，按钮用 `<Auth code>`，逻辑用 `useAuth().can()`。前端权限只控制展示，真实鉴权必须在后端。
- **表单校验**：Zod 错误信息写成 `common:validation.*` 的 key（如 `'required'`），`FormField` 会翻译；未登记的文案原样显示。
- **环境变量**：必须以 `VITE_` 开头，在 `shared/config/env.ts` 的 schema 和 `vite-env.d.ts` 中声明，缺失会在启动时报错。
- **提交**：Conventional Commits（`feat: ...`、`fix: ...`），subject 不要以大写字母开头；提交时自动运行 lint-staged 与 commitlint。

## 开发指南

**新增页面**

1. 在 `features/<module>/pages/` 新建页面（default export）。
2. 在 `app/router/menu-routes.tsx` 添加配置：`path`、`titleKey`、`icon`、`permission`、`lazy`。
3. 在 `locales/*/layout.json` 补 `menu.<name>` 三语文案。

菜单、面包屑、路由守卫、403 展示会自动生效。

**新增接口与列表**：`api.ts` 用 `http.get<T>()` 封装接口，`keys.ts` 用 `createQueryKeys()` 生成 key，变更成功后 `invalidateQueries({ queryKey: xxxKeys.lists() })`。分页列表用 `useTable`，参考 `features/system/pages/UsersPage.tsx`。

**表单**：RHF + Zod + `FormField`，弹窗用 `FormModal`，参考 `features/system/components/UserFormModal.tsx`。

**国际化**

- 文案放在 `src/locales/<语言>/<命名空间>.json`，三种语言保持同步。
- 新命名空间：加 json，并更新 `locales/index.ts` 的 `ns` 与 `locales/i18next.d.ts`（类型提示）。
- 新语言：新建目录，并更新 `locales/config.ts` 中的 `LANGUAGES`、`antdLocaleMap`、`dayjsLocaleMap`。
- 切换语言一律调用 `changeLanguage()`。

**主题**：`theme/config.ts` 的 `buildThemeConfig` 控制 AntD token 和组件级定制；Sass / CSS Modules 里用 `var(--app-color-primary)` 等变量，`styles/_variables.scss` 自动注入每个 scss 文件。

**Mock**：在 `src/mocks/handlers/` 添加 handler 并在 `handlers/index.ts` 注册。调试端点：`/mock/status/:code`（返回指定状态码）、`/mock/timeout`（永不返回）。Mock 只在 `vite serve` 时启用，不会进入生产构建。

**对接真实后端**：把 `.env.development` 的 `VITE_USE_MOCK` 改为 `false`，并在 `vite.config.ts` 的 `server.proxy` 中把 `/api` 代理到后端地址（或把 `VITE_API_BASE_URL` 设为完整地址，需后端配置 CORS）。

**测试**：测试文件与源码同目录（`*.test.ts(x)`）。需要接口时用 MSW：`setupServer(...handlers)`，并设置 `onUnhandledFrame: 'error'`。异步结果用 `findBy*` / `waitFor`。

## 注意事项

- TypeScript 固定在 `~6.0`：typescript-eslint 暂不支持 7.x，升级前先确认兼容性。
- MSW 3.x 的 API 与 2.x 不同：未处理请求选项是 `onUnhandledFrame`，`http` / `HttpResponse` 从 `msw/http` 导入。
- AntD 会在两个汉字的按钮文字间自动加空格（如“删 除”），测试里按钮名用 `/删\s*除/` 匹配；如需关闭，在 `ConfigProvider` 设置 `button={{ autoInsertSpace: false }}`。
- Token 存放在 localStorage（Zustand persist）；若后端支持，建议改为 httpOnly cookie。
- 表单弹窗只在打开时挂载，每次打开都是干净的表单状态。
- Dashboard 的图表区是预留占位，不需要时删除 `DashboardPage.tsx` 中标注的区块即可。
