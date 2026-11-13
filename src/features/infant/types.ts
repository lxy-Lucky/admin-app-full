import type { RateRow, RateUpdateItem } from '@/shared/rate-table'

export type { RateUpdateItem }

export interface YearFilter {
  year: number
}

/** When and by whom a summary was run / registered. null = not done yet. */
export interface ExecuteInfo {
  executedAt: string
  executedBy: string
  /** Rate tables only: last manual edit. */
  updatedAt?: string | null
  updatedBy?: string | null
}

type Ages = 0 | 1 | 2 | 3 | 4 | 5
/** `${prefix}CountAge0..5` and `${prefix}CountTotal`. */
type AgeCounts<P extends string> = Record<`${P}CountAge${Ages}` | `${P}CountTotal`, number>
type Grades = 1 | 2 | 3 | 4 | 5 | 6
/** `${prefix}CntG1..6` and `${prefix}CntTotal`. */
type GradeCounts<P extends string> = Record<`${P}CntG${Grades}` | `${P}CntTotal`, number>

/** 学区域不明児 */
export interface FumeiRow {
  id: number
  personName: string
  age: number
  birthDate: string
  wardNm: string
  azaName: string
  banchigou: string
  katagaki: string
  branchNum: string
  fumeiReason: string
}

/** 1次集計（入力票） */
export interface Summary1Row {
  id: number
  wardNm: string
  machiAzaNm: string
  banchiFrom: string
  banchiTo: string
  countAge0: number
  countAge1: number
  countAge2: number
  countAge3: number
  countAge4: number
  countAge5: number
  /** Row added through the input sheet. */
  addedFromSheet: boolean
}

/** 2次集計: designated school -> receiving school(s). Null receiving school = no transfer. */
export type Summary2Row = {
  id: number
  shiteikouCode: string
  shiteikouNm: string
  ukeirekouCode: string | null
  ukeirekouNm: string | null
  ukeirekou2Code: string | null
  ukeirekou2Nm: string | null
  anbunRate: number | null
  anbun2Rate: number | null
} & AgeCounts<'shiteikou'> &
  AgeCounts<'anbun'> &
  AgeCounts<'anbun2'> &
  AgeCounts<'result'>

/** 3次集計 */
export interface Summary3Row {
  id: number
  schoolNm: string
  schoolCode: string
  countAge0: number
  countAge1: number
  countAge2: number
  countAge3: number
  countAge4: number
  countAge5: number
}

export type AnbunListFlag = 'auto' | 'registered'

export interface AnbunFilter extends YearFilter {
  listFlag: AnbunListFlag
}

/** 特調校按分登録 row (second receiving school may be absent). */
export type AnbunRow = {
  id: number
  ukeirekouCode: string
  ukeirekouNm: string
  ukeirekou2Code: string | null
  ukeirekou2Nm: string | null
  shiteikouCode: string
  shiteikouNm: string
  anbunRateThisYear: number | null
  anbunRateAvg3Year: number | null
  anbunRate3YearAgo: number | null
  anbunRate2YearAgo: number | null
  anbunRate1YearAgo: number | null
  anbun2RateThisYear: number | null
  anbun2RateAvg3Year: number | null
  anbun2Rate3YearAgo: number | null
  anbun2Rate2YearAgo: number | null
  anbun2Rate1YearAgo: number | null
} & GradeCounts<'shiteikou'> &
  GradeCounts<'ukeirekou'> &
  Partial<Record<`ukeirekou2CntG${Grades}` | 'ukeirekou2CntTotal', number | null>>

/** 常態化した指定地区外の按分人数 */
export interface RoutineAnbunRow {
  id: number
  shiteikouCode: string
  shiteikouNm: string
  anbunCountAge0: number
  anbunCountAge1: number
  anbunCountAge2: number
  anbunCountAge3: number
  anbunCountAge4: number
  anbunCountAge5: number
  totalAnbunCount: number
  ukeirekouCode: string
  ukeirekouNm: string
}

/** 増減率表 */
export interface InfantChangeRow extends RateRow {
  lastYearAge0: number | null
  lastYearAge1: number | null
  lastYearAge2: number | null
  lastYearAge3: number | null
  lastYearAge4: number | null
  lastYearTotal: number | null
  thisYearAge1: number | null
  thisYearAge2: number | null
  thisYearAge3: number | null
  thisYearAge4: number | null
  thisYearAge5: number | null
  thisYearTotal: number | null
}

/** 就学率表 */
export interface InfantEnrolRow extends RateRow {
  /** Last year's 5-year-olds. */
  countAge5: number | null
  /** This year's first graders. */
  students1: number | null
}

export type RateKind = 'change' | 'enrol'
