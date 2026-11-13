import type { RateRow } from '@/shared/rate-table'

export type ClassKind = 'elem' | 'jhs'

type Grades6 = 1 | 2 | 3 | 4 | 5 | 6
type Grades3 = 1 | 2 | 3

/** 児童・学級数 (elementary): pupils and classes per grade. */
export type ElemClassRow = {
  id: number
  schoolNm: string
  schoolCode: string
  totalStudents: number | null
  totalClasses: number | null
  specialStudents: number | null
  specialClasses: number | null
} & Record<`students${Grades6}` | `classes${Grades6}`, number | null>

/** 生徒・学級数 (junior high): students and classes per grade. */
export type JhsClassRow = {
  id: number
  schoolNm: string
  schoolCode: string
  totalStudents: number | null
  totalClasses: number | null
  specialStudents: number | null
  specialClasses: number | null
} & Record<`jhs${Grades3}Students` | `jhs${Grades3}Classes`, number | null>

/** 小学校増減率表: last year's grades 1-5 and this year's grades 2-6. */
export type ElemChangeRow = RateRow & {
  lastYearTotal: number | null
  thisYearTotal: number | null
} & Record<
    `lastYearStudents${1 | 2 | 3 | 4 | 5}` | `thisYearStudents${2 | 3 | 4 | 5 | 6}`,
    number | null
  >

/** 中学校増減率表: last year's grades 1-2 and this year's grades 2-3. */
export type JhsChangeRow = RateRow & {
  lastYearJhsTotal: number | null
  thisYearJhsTotal: number | null
} & Record<`lastYearJhs${1 | 2}Students` | `thisYearJhs${2 | 3}Students`, number | null>
