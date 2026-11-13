/**
 * 费率采纳方式
 *
 * 用于标识本年度采用的费率来源。
 * null 表示尚未选择采纳方式。
 */
export const ADOPT_KBN = {
  /** 采用近三年平均费率。 */
  AVG3: '1',
  /** 采用近五年平均费率。 */
  AVG5: '2',
  /** 采用手动输入的其他费率。 */
  OTHER: '9',
} as const

/** 费率采纳方式的联合类型。 */
export type AdoptKbn = (typeof ADOPT_KBN)[keyof typeof ADOPT_KBN]

/**
 * 费率表格行数据。
 *
 * 各类费率表格共用此结构，包括幼儿园异动/在籍人数、
 * 小学和初中费率表格。
 */
export interface RateRow {
  id: number
  wardCode: string
  schoolCode: string
  schoolNm: string

  /** 过去四年至本年度的历史费率。 */
  rate4yAgo: number | null
  rate3yAgo: number | null
  rate2yAgo: number | null
  rate1yAgo: number | null
  rateThisYear: number | null
  avg2Rate: number | null
  avg3Rate: number | null
  avg5Rate: number | null

  /** 手动输入的其他费率。 */
  miscRate: number | null
  lastYearRate: number | null

  /** 本年度最终采纳的费率值。 */
  thisYearRate: number | null

  /** 本年度费率采纳方式，未选择时为 null。 */
  adoptKbn: AdoptKbn | null
  note: string | null
}

/**
 * 单行费率的本地编辑状态。
 *
 * 保存用户当前选择的采纳方式、费率和备注，
 * 尚未提交到后端。
 */
export interface RateEdit {
  adoptKbn: AdoptKbn | null
  thisYearRate: number | null
  otherRate: number | null
  note: string
}

/**
 * 单行费率更新请求数据。
 *
 * 用于提交当前页面的编辑结果。
 */
export interface RateUpdateItem {
  id: number
  adoptKbn: AdoptKbn | null

  /** 其他费率，即使当前没有选择 OTHER，也保留该字段的值。 */
  miscRate: number | null
  note: string
}
