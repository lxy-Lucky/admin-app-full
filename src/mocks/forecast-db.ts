import type {
  ElemChangeRow,
  ElemClassRow,
  JhsChangeRow,
  JhsClassRow,
} from '@/features/forecast/types'
import { genRateBase, schools, type Stored } from './infant-db'

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

/** Pupils / classes per grade, e.g. students1..6 and classes1..6. */
function perGrade(prefix: (g: number) => string, grades: number, i: number, base: number) {
  const out: Record<string, number> = {}
  for (let g = 1; g <= grades; g++) out[prefix(g)] = base + ((i + g) % 15)
  return out
}

export function genElemClass(): ElemClassRow[] {
  return schools('1').map((school, i) => {
    const students = [1, 2, 3, 4, 5, 6].map((g) => 20 + ((i + g) % 15))
    const classes = [1, 2, 3, 4, 5, 6].map((g) => 1 + ((i + g) % 3))
    const row: Record<string, unknown> = {
      id: i + 1,
      schoolNm: school.schoolNm,
      schoolCode: school.codePre,
      totalStudents: sum(students),
      totalClasses: sum(classes),
      specialStudents: i % 4,
      specialClasses: i % 3 === 0 ? 1 : 0,
    }
    students.forEach((v, g) => (row[`students${g + 1}`] = v))
    classes.forEach((v, g) => (row[`classes${g + 1}`] = v))
    return row as unknown as ElemClassRow
  })
}

export function genJhsClass(): JhsClassRow[] {
  return schools('5').map((school, i) => {
    const students = [1, 2, 3].map((g) => 30 + ((i * 2 + g) % 20))
    const classes = [1, 2, 3].map((g) => 3 + ((i + g) % 3))
    const row: Record<string, unknown> = {
      id: i + 1,
      schoolNm: school.schoolNm,
      schoolCode: school.codePre,
      totalStudents: sum(students),
      totalClasses: sum(classes),
      specialStudents: i % 3,
      specialClasses: i % 2,
    }
    students.forEach((v, g) => (row[`jhs${g + 1}Students`] = v))
    classes.forEach((v, g) => (row[`jhs${g + 1}Classes`] = v))
    return row as unknown as JhsClassRow
  })
}

export function genElemChange(): ElemChangeRow[] {
  return schools('1').map((school, i) => {
    const last = perGrade((g) => `lastYearStudents${g}`, 5, i, 25)
    const now = (() => {
      const o: Record<string, number> = {}
      for (let g = 2; g <= 6; g++) o[`thisYearStudents${g}`] = 24 + ((i * 2 + g) % 14)
      return o
    })()
    return {
      ...genRateBase(i, school),
      ...last,
      lastYearTotal: sum(Object.values(last)),
      ...now,
      thisYearTotal: sum(Object.values(now)),
    } as unknown as ElemChangeRow
  })
}

export function genJhsChange(): JhsChangeRow[] {
  return schools('5').map((school, i) => {
    const last = { lastYearJhs1Students: 90 + (i % 11), lastYearJhs2Students: 88 + (i % 9) }
    const now = { thisYearJhs2Students: 92 + (i % 10), thisYearJhs3Students: 89 + (i % 8) }
    return {
      ...genRateBase(i, school),
      ...last,
      lastYearJhsTotal: sum(Object.values(last)),
      ...now,
      thisYearJhsTotal: sum(Object.values(now)),
    } as unknown as JhsChangeRow
  })
}

function seed() {
  const year = new Date().getFullYear()
  const run = () => ({ executedAt: `${year}/04/10 10:00:00`, executedBy: 'Admin' })
  const stored = <T>(rows: T[]) => new Map<number, Stored<T>>([[year, { run: run(), rows }]])
  return {
    elemClass: stored(genElemClass()),
    jhsClass: stored(genJhsClass()),
    elemRates: stored(genElemChange()),
    jhsRates: stored(genJhsChange()),
  }
}

export const forecastDb = seed()

export function resetForecastDb() {
  Object.assign(forecastDb, seed())
}
