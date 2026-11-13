import '@testing-library/jest-dom/vitest'

/**
 * 测试环境初始化
 *
 * 加载 Testing Library 的 DOM 断言扩展，
 * 并补齐 jsdom 缺失的浏览器 API，保证组件测试正常运行。
 */

// jsdom 未实现 matchMedia，Ant Design 的响应式断点和菜单溢出检测依赖该 API。
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom 未提供 ResizeObserver，使用空实现满足依赖该 API 的组件测试。
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
