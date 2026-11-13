import { Table, type TableProps } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFillHeight } from '@/shared/hooks'

interface DataTableProps<T> extends TableProps<T> {
  /** 表格上方左侧区域，通常用于搜索和筛选控件。 */
  filters?: ReactNode
  /** 表格上方右侧区域，通常用于新增、导出等操作按钮。 */
  actions?: ReactNode
  /** 表格内容区固定高度，支持数字（像素）或 CSS 长度。 */
  scrollY?: number | string
  /** 是否自动填充视口剩余高度，启用后表格内容区独立滚动。 */
  fillHeight?: boolean
}

/**
 * 通用数据表格组件。
 *
 * 基于 Ant Design Table 封装，统一表格尺寸、横向滚动、
 * 分页配置及总数文案，并提供顶部筛选区和操作区。
 * 支持固定内容区高度或自动填充视口剩余高度。
 */
export default function DataTable<T extends object>({
  filters,
  actions,
  pagination,
  scrollY,
  fillHeight = false,
  ...rest
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const { ref: fillRef, height: fillPx } = useFillHeight(fillHeight)
  return (
    <>
      {(filters || actions) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>{filters}</div>
          <div>{actions}</div>
        </div>
      )}
      <div ref={fillRef}>
        <Table<T>
          size="middle"
          scroll={{ x: 'max-content', y: fillHeight ? fillPx : scrollY }}
          pagination={
            pagination === false
              ? false
              : {
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (total) => t('table.total', { total }),
                  ...pagination,
                }
          }
          {...rest}
        />
      </div>
    </>
  )
}
