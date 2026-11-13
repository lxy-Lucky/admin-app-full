import { useState } from 'react'
import { ADOPT_KBN, type RateEdit, type RateRow, type RateUpdateItem } from './types'

/** 未编辑时的默认费率状态。 */
const EMPTY_EDIT: RateEdit = { adoptKbn: null, thisYearRate: null, otherRate: null, note: '' }
/** 默认空数据，避免未传入 rows 时重复创建数组。 */
const NO_ROWS: RateRow[] = []

/**
 * 将接口返回的费率数据转换为本地编辑状态。
 * 使用行 ID 作为索引，方便独立读取和更新每一行。
 */
function fromRows(rows: RateRow[]): Record<number, RateEdit> {
  return Object.fromEntries(
    rows.map((r) => [
      r.id,
      {
        adoptKbn: r.adoptKbn,
        thisYearRate: r.thisYearRate,
        otherRate: r.miscRate,
        note: r.note ?? '',
      },
    ]),
  )
}

/** 费率编辑 Hook 的返回类型。 */
export type RateEdits = ReturnType<typeof useRateEdits>

/**
 * 管理当前费率表格页面尚未保存的编辑状态。
 *
 * - 初始状态根据接口返回的 rows 生成。
 * - rows 引用变化时，重新初始化编辑状态。
 * - 支持按行读取和局部更新编辑内容。
 * - 提供保存数据转换和其他费率完整性校验。
 */
export function useRateEdits(rows: RateRow[] = NO_ROWS) {
  const [source, setSource] = useState(rows)
  const [edits, setEdits] = useState(() => fromRows(rows))

  // 新一批数据加载后，丢弃上一批数据的未保存修改并重新初始化。
  if (rows !== source) {
    setSource(rows)
    setEdits(fromRows(rows))
  }
  /** 获取指定行的编辑状态，没有记录时返回默认值。 */
  const get = (id: number): RateEdit => edits[id] ?? EMPTY_EDIT
  /** 合并指定行的局部修改，不影响其他字段和行。 */
  const patch = (id: number, change: Partial<RateEdit>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_EDIT), ...change } }))

  return {
    get,
    patch,

    /**
     * 生成当前页面所有行的保存请求数据。
     * 将本地 otherRate 映射为接口字段 miscRate。
     */
    toUpdateList: (): RateUpdateItem[] =>
      rows.map((r) => {
        const edit = get(r.id)
        return { id: r.id, adoptKbn: edit.adoptKbn, miscRate: edit.otherRate, note: edit.note }
      }),

    /**
     * 查找第一个选择了其他费率、但尚未填写费率的行。
     * 返回 undefined 表示当前页面不存在此类问题。
     */
    findMissingOtherRate: (): RateRow | undefined =>
      rows.find((r) => get(r.id).adoptKbn === ADOPT_KBN.OTHER && get(r.id).otherRate == null),
  }
}
