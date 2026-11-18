import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

/**
 * 表格自适应高度 Hook
 *
 * 根据页面剩余可用空间动态计算 Ant Design Table 的滚动高度，
 * 使表格内容在内部滚动，尽量避免页面出现纵向滚动条。
 *
 * @param enabled 是否启用自适应高度
 * @param minHeight 表格滚动区域的最小高度，默认 60px
 */
export function useFillHeight(enabled: boolean, minHeight = 60) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(minHeight)

  useLayoutEffect(() => {
    const wrap = ref.current
    const main = wrap?.closest('main')
    if (!enabled || !wrap || !main) return

    // 判断 main 容器当前是否存在垂直滚动条
    const hasScrollbar = () => main.offsetWidth !== main.clientWidth
    let hadScrollbar = hasScrollbar()
    let settle: number | undefined

    // 临时隐藏滚动条，避免高度调整过程中滚动条反复出现导致布局抖动
    const holdScrollbar = () => {
      if (!hadScrollbar) main.style.overflowY = 'hidden'
      window.clearTimeout(settle)

      // 延迟恢复滚动条，等待连续的布局调整结束
      settle = window.setTimeout(() => {
        main.style.overflowY = ''
        hadScrollbar = hasScrollbar()
      }, 300)
    }

    const fit = (sync: boolean) => {
      holdScrollbar()
      const body = wrap.querySelector<HTMLElement>('.ant-table-body')
      const last = main.lastElementChild
      if (!body || !last) return
      const paddingBottom = parseFloat(getComputedStyle(main).paddingBottom) || 0

      // 计算 main 容器底部到最后一个子元素底部之间的剩余空间
      // scrollTop 用于将子元素的视口坐标转换为容器滚动内容坐标
      const free =
        main.getBoundingClientRect().bottom -
        paddingBottom -
        (last.getBoundingClientRect().bottom + main.scrollTop)
      if (Math.abs(free) < 1) return

      // 在当前表格滚动高度基础上增加或减少剩余空间，并限制最小高度
      const next = Math.max(minHeight, Math.floor(body.clientHeight + free))
      const update = () => setHeight((prev) => (Math.abs(prev - next) < 1 ? prev : next))

      // ResizeObserver 回调中同步更新高度，确保本轮布局调整及时生效
      if (sync) flushSync(update)
      else update()
    }

    fit(false)
    const onResize = () => fit(true)
    const observer = new ResizeObserver(onResize)
    const watch = () => {
      observer.disconnect()
      observer.observe(main)
      if (main.lastElementChild) observer.observe(main.lastElementChild)
    }
    watch()
    const mutations = new MutationObserver(watch)
    mutations.observe(main, { childList: true })
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      window.clearTimeout(settle)
      main.style.overflowY = ''
      window.removeEventListener('resize', onResize)
    }
  }, [enabled, minHeight])

  return { ref, height }
}
