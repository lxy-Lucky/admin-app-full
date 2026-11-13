import type { ColumnsType } from 'antd/es/table'
import type { ReactNode } from 'react'

const AGES = [0, 1, 2, 3, 4, 5] as const
const GRADES = [1, 2, 3, 4, 5, 6] as const

/** A sortable text/number column keyed by its field name. */
export function col<T extends object>(
  title: ReactNode,
  field: string,
  width?: number,
  extra: Partial<ColumnsType<T>[number]> = {},
): ColumnsType<T>[number] {
  return { title, dataIndex: field, key: field, width, sorter: true, ...extra }
}

/** Columns `${prefix}Age0..5` (+ `${prefix}Total`) holding head counts. */
export function ageColumns<T extends object>(
  title: (age: number) => ReactNode,
  field: (age: number) => string,
  options: {
    total?: { title: ReactNode; field: string }
    render?: (v: number, row: T) => ReactNode
  } = {},
): ColumnsType<T> {
  const cols: ColumnsType<T> = AGES.map((age) =>
    col<T>(title(age), field(age), 70, { align: 'right', render: options.render }),
  )
  if (options.total) {
    cols.push(
      col<T>(options.total.title, options.total.field, 80, {
        align: 'right',
        render: options.render,
      }),
    )
  }
  return cols
}

/** Columns `${prefix}CntG1..6` + `${prefix}CntTotal` holding head counts per grade. */
export function gradeColumns<T extends object>(
  prefix: string,
  gradeTitle: (grade: number) => ReactNode,
  totalTitle: ReactNode,
  render?: (v: number | null, row: T) => ReactNode,
): ColumnsType<T> {
  return [
    ...GRADES.map((g) =>
      col<T>(gradeTitle(g), `${prefix}CntG${g}`, 70, { align: 'right', render }),
    ),
    col<T>(totalTitle, `${prefix}CntTotal`, 80, { align: 'right', render }),
  ]
}
