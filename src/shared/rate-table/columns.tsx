import { Input, InputNumber, Radio } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TFunction } from 'i18next'
import type { CSSProperties, ReactNode } from 'react'
import type { RateEdits } from './useRateEdits'
import { ADOPT_KBN, type AdoptKbn, type RateRow } from './types'

/**
 * 费率表格列配置
 *
 * 统一管理学校基础信息列、人数列和费率业务列，
 * 支持费率采纳、其他费率编辑及备注维护。
 */

/** 费率保留三位小数，无数据时显示为空。 */
export const renderRate = (value: number | null) => (value == null ? '' : value.toFixed(3))

/** 高亮当前采纳的费率单元格，并使用 Ant Design 主题变量适配明暗主题。 */
const adopted = (selected: boolean): CSSProperties | undefined =>
  selected ? { background: 'var(--ant-color-warning-bg)', padding: '2px 4px' } : undefined

/** 所有费率表格共用的学校基础信息列。 */
export function schoolColumns<T extends RateRow>(t: TFunction): ColumnsType<T> {
  return [
    { title: t('rate.wardCode'), dataIndex: 'wardCode', key: 'wardCode', width: 90, sorter: true },
    {
      title: t('rate.schoolCode'),
      dataIndex: 'schoolCode',
      key: 'schoolCode',
      width: 100,
      sorter: true,
    },
    { title: t('rate.schoolNm'), dataIndex: 'schoolNm', key: 'schoolNm', width: 140, sorter: true },
  ]
}

/** 生成右对齐、支持排序的人数列。 */
export function countColumn<T extends object>(
  title: ReactNode,
  field: string,
  width = 100,
): ColumnsType<T>[number] {
  return { title, dataIndex: field, key: field, width, sorter: true, align: 'right' }
}

/**
 * 生成费率业务列。
 *
 * 包含近五年费率、三年 / 五年平均费率、其他费率、
 * 上年度采纳费率及备注，并支持选择和编辑采纳费率。
 */
export function rateColumns<T extends RateRow>(
  t: TFunction,
  year: number,
  edits: RateEdits,
): ColumnsType<T> {
  const history = (
    ['rate4yAgo', 'rate3yAgo', 'rate2yAgo', 'rate1yAgo', 'rateThisYear'] as const
  ).map((field, i) => ({
    // 日本年号：2019 年对应令和元年（R1）。
    title: t('rate.rateTitle', { n: year - 2018 - (4 - i) }),
    dataIndex: field,
    key: field,
    width: 90,
    sorter: true,
    align: 'right' as const,
    render: renderRate,
  }))

  const average = (title: string, field: 'avg3Rate' | 'avg5Rate', kbn: AdoptKbn) => ({
    title,
    dataIndex: field,
    key: field,
    width: 110,
    sorter: true,
    align: 'right' as const,
    render: (value: number | null, row: T) => (
      <span style={adopted(edits.get(row.id).adoptKbn === kbn)}>
        <Radio
          checked={edits.get(row.id).adoptKbn === kbn}
          disabled={value == null}
          onChange={() => edits.patch(row.id, { adoptKbn: kbn, thisYearRate: value })}
        >
          {renderRate(value)}
        </Radio>
      </span>
    ),
  })

  return [
    ...history,
    average(t('rate.avg3'), 'avg3Rate', ADOPT_KBN.AVG3),
    average(t('rate.avg5'), 'avg5Rate', ADOPT_KBN.AVG5),
    {
      title: t('rate.other'),
      key: 'otherRate',
      width: 150,
      render: (_: unknown, row: T) => {
        const edit = edits.get(row.id)
        return (
          <span style={adopted(edit.adoptKbn === ADOPT_KBN.OTHER)}>
            <Radio
              checked={edit.adoptKbn === ADOPT_KBN.OTHER}
              onChange={() =>
                edits.patch(row.id, { adoptKbn: ADOPT_KBN.OTHER, thisYearRate: edit.otherRate })
              }
            >
              <InputNumber
                size="small"
                style={{ width: 80 }}
                aria-label={t('rate.other')}
                min={0}
                max={99.999}
                step={0.001}
                precision={3}
                value={edit.otherRate}
                // 输入其他费率时，自动将采纳类型切换为 OTHER。
                onChange={(rate) =>
                  edits.patch(row.id, {
                    adoptKbn: ADOPT_KBN.OTHER,
                    otherRate: rate,
                    thisYearRate: rate,
                  })
                }
              />
            </Radio>
          </span>
        )
      },
    },
    {
      title: t('rate.lastYearRate'),
      dataIndex: 'lastYearRate',
      key: 'lastYearRate',
      width: 110,
      sorter: true,
      align: 'right',
      render: renderRate,
    },
    {
      title: t('rate.note'),
      key: 'note',
      width: 280,
      render: (_: unknown, row: T) => (
        <Input
          size="small"
          maxLength={300}
          aria-label={t('rate.note')}
          value={edits.get(row.id).note}
          onChange={(e) => edits.patch(row.id, { note: e.target.value })}
        />
      ),
    },
  ]
}
