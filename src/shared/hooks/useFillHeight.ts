import { useLayoutEffect, useRef, useState } from 'react'

/**
 * 表格自适应高度 Hook
 *
 * 根据页面剩余可用空间动态计算 Ant Design Table 的滚动高度，
 * 使表格内容在内部滚动，尽量避免页面出现纵向滚动条。
 *
 * @param enabled 是否启用自适应高度
 * @param minHeight 表格滚动区域的最小高度，默认 100px
 */
export function useFillHeight(enabled: boolean, minHeight = 100) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(minHeight)

  useLayoutEffect(() => {
    const wrap = ref.current
    const main = wrap?.closest('main')
    if (!enabled || !wrap || !main) return

    const fit = () => {
      const body = wrap.querySelector<HTMLElement>('.ant-table-body')
      const last = main.lastElementChild
      if (!body || !last) return
      const marginBottom = parseFloat(getComputedStyle(main).marginBottom) || 0
      // 根据页面底部与视口底部的距离，计算表格当前可调整的空间。
      const free = window.innerHeight - last.getBoundingClientRect().bottom - marginBottom
      if (Math.abs(free) < 1) return
      // 在当前表格高度基础上调整，限制最小高度，避免出现过小的滚动区域。
      const next = Math.max(minHeight, Math.floor(body.clientHeight + free))
      // 忽略小于 1px 的变化，避免无意义的状态更新。
      setHeight((prev) => (Math.abs(prev - next) < 1 ? prev : next))
    }

    fit()
    const observer = new ResizeObserver(fit)
    if (main.lastElementChild) observer.observe(main.lastElementChild)
    window.addEventListener('resize', fit)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [enabled, minHeight])

  return { ref, height }
}
