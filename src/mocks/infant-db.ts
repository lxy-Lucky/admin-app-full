import dayjs from 'dayjs'
import type {
  AnbunRow,
  ExecuteInfo,
  FumeiRow,
  InfantChangeRow,
  InfantEnrolRow,
  RoutineAnbunRow,
  Summary1Row,
  Summary2Row,
  Summary3Row,
} from '@/features/infant/types'
import type { AdoptKbn } from '@/shared/rate-table'
import { generate, wards } from './master-db'

const pad = (n: number, len: number) => String(n).padStart(len, '0')
const towns = ['本町', '中央', '緑ヶ丘', '桜木町', '港町']
const familyNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺']
const givenNames = ['太郎', '花子', '一郎', '美咲', '健太', '結衣']

/** Elementary schools the mock summaries talk about (same names as the school master mock). */
export const schools = (kbn: '1' | '5' = '1') =>
  generate.schools(30).filter((s) => s.schoolKbn === kbn)

export const nowText = () => dayjs().format('YYYY/MM/DD HH:mm:ss')

function genFumei(count: number): FumeiRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    personName: `${familyNames[i % 6]} ${givenNames[(i * 5) % 6]}`,
    age: i % 6,
    birthDate: dayjs('2021-04-02')
      .add(i * 17, 'day')
      .format('YYYY-MM-DD'),
    wardNm: wards[i % wards.length]!.wardNm,
    azaName: `${towns[i % towns.length]}${(i % 4) + 1}丁目`,
    banchigou: `${(i % 30) + 1}番地${(i % 9) + 1}号`,
    katagaki: i % 3 === 0 ? `コーポ${(i % 9) + 1}0${(i % 4) + 1}` : '',
    branchNum: pad(i * 7, 20),
    fumeiReason: i % 2 === 0 ? '学区域情報に該当なし' : '番地コード範囲外',
  }))
}

function genSummary1(count: number): Summary1Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    wardNm: wards[i % wards.length]!.wardNm,
    machiAzaNm: towns[i % towns.length]!,
    banchiFrom: pad(i * 3, 5),
    banchiTo: pad(i * 3 + 2, 5),
    countAge0: i % 4,
    countAge1: (i + 1) % 4,
    countAge2: (i + 2) % 4,
    countAge3: (i + 3) % 5,
    countAge4: i % 3,
    countAge5: (i + 1) % 3,
    addedFromSheet: i % 4 === 3,
  }))
}

function genSummary2(count: number): Summary2Row[] {
  const list = schools()
  return Array.from({ length: count }, (_, i) => {
    const shiteikou = list[i % list.length]!
    const first = i % 5 === 4 ? null : list[(i + 3) % list.length]!
    const second = first && i % 3 === 0 ? list[(i + 7) % list.length]! : null
    const row: Record<string, unknown> = {
      id: i + 1,
      shiteikouCode: shiteikou.codePre,
      shiteikouNm: shiteikou.schoolNm,
      ukeirekouCode: first?.codePre ?? null,
      ukeirekouNm: first?.schoolNm ?? null,
      ukeirekou2Code: second?.codePre ?? null,
      ukeirekou2Nm: second?.schoolNm ?? null,
      anbunRate: first ? 0.3 : null,
      anbun2Rate: second ? 0.2 : null,
    }
    // Head counts: before, transferred to school 1 / 2, and after.
    const sum = (prefix: string, values: number[]) => {
      values.forEach((v, age) => (row[`${prefix}CountAge${age}`] = v))
      row[`${prefix}CountTotal`] = values.reduce((a, b) => a + b, 0)
    }
    const before = [0, 1, 2, 3, 4, 5].map((age) => 8 + ((i + age) % 7))
    const part = (rate: number) => before.map((v) => Math.round(v * rate))
    const to1 = first ? part(0.3) : before.map(() => 0)
    const to2 = second ? part(0.2) : before.map(() => 0)
    sum('shiteikou', before)
    sum('anbun', to1)
    sum('anbun2', to2)
    sum(
      'result',
      before.map((v, age) => v - to1[age]! - to2[age]!),
    )
    return row as unknown as Summary2Row
  })
}

function genSummary3(count: number): Summary3Row[] {
  const list = schools()
  return Array.from({ length: count }, (_, i) => {
    const school = list[i % list.length]!
    const counts = [0, 1, 2, 3, 4, 5].map((age) => 6 + ((i * 2 + age) % 9))
    // Every 5th row has a negative cell (routine allocation > 2nd summary result).
    if (i % 5 === 4) counts[2] = -2
    return {
      id: i + 1,
      schoolNm: school.schoolNm,
      schoolCode: school.codePre,
      countAge0: counts[0]!,
      countAge1: counts[1]!,
      countAge2: counts[2]!,
      countAge3: counts[3]!,
      countAge4: counts[4]!,
      countAge5: counts[5]!,
    }
  })
}

export function genAnbun(count: number): AnbunRow[] {
  const list = schools()
  return Array.from({ length: count }, (_, i) => {
    const shiteikou = list[i % list.length]!
    const first = list[(i + 3) % list.length]!
    const second = i % 3 === 0 ? list[(i + 7) % list.length]! : null
    const row: Record<string, unknown> = {
      id: i + 1,
      shiteikouCode: shiteikou.codePre,
      shiteikouNm: shiteikou.schoolNm,
      ukeirekouCode: first.codePre,
      ukeirekouNm: first.schoolNm,
      ukeirekou2Code: second?.codePre ?? null,
      ukeirekou2Nm: second?.schoolNm ?? null,
    }
    let total1 = 0
    let total2 = 0
    let total3 = 0
    for (let g = 1; g <= 6; g++) {
      const a = 20 + ((i + g) % 9)
      const b = 15 + ((i * 2 + g) % 7)
      const c = 10 + ((i + g * 2) % 5)
      row[`shiteikouCntG${g}`] = a
      row[`ukeirekouCntG${g}`] = b
      row[`ukeirekou2CntG${g}`] = second ? c : null
      total1 += a
      total2 += b
      total3 += c
    }
    row.shiteikouCntTotal = total1
    row.ukeirekouCntTotal = total2
    row.ukeirekou2CntTotal = second ? total3 : null
    const rate = (base: number) => Number((base + (i % 5) * 0.01).toFixed(3))
    for (const [prefix, base, on] of [
      ['anbun', 0.4, true],
      ['anbun2', 0.2, !!second],
    ] as const) {
      row[`${prefix}RateThisYear`] = on ? rate(base) : null
      row[`${prefix}RateAvg3Year`] = on ? rate(base + 0.02) : null
      row[`${prefix}Rate3YearAgo`] = on ? rate(base - 0.03) : null
      row[`${prefix}Rate2YearAgo`] = on ? rate(base - 0.01) : null
      row[`${prefix}Rate1YearAgo`] = on ? rate(base) : null
    }
    return row as unknown as AnbunRow
  })
}

export function genRoutine(count: number): RoutineAnbunRow[] {
  const list = schools()
  return Array.from({ length: count }, (_, i) => {
    const shiteikou = list[i % list.length]!
    const receiving = list[(i + 2) % list.length]!
    const ages = [0, 1, 2, 3, 4, 5].map((age) => (i + age) % 4)
    return {
      id: i + 1,
      shiteikouCode: shiteikou.codePre,
      shiteikouNm: shiteikou.schoolNm,
      anbunCountAge0: ages[0]!,
      anbunCountAge1: ages[1]!,
      anbunCountAge2: ages[2]!,
      anbunCountAge3: ages[3]!,
      anbunCountAge4: ages[4]!,
      anbunCountAge5: ages[5]!,
      totalAnbunCount: ages.reduce((a, b) => a + b, 0),
      ukeirekouCode: receiving.codePre,
      ukeirekouNm: receiving.schoolNm,
    }
  })
}

/** Rate columns shared by the change-rate and enrolment-rate tables. */
export function genRateBase(i: number, school: ReturnType<typeof schools>[number]) {
  const r = (base: number) => Number((base + ((i * 7) % 20) / 1000).toFixed(3))
  const avg3 = r(0.95)
  const avg5 = r(0.97)
  const adopt: AdoptKbn | null = i % 3 === 0 ? '1' : i % 3 === 1 ? '2' : null
  return {
    id: i + 1,
    wardCode: school.wardCode,
    schoolCode: school.codeGov,
    schoolNm: school.schoolNm,
    rate4yAgo: r(0.93),
    rate3yAgo: r(0.94),
    rate2yAgo: r(0.96),
    rate1yAgo: r(0.95),
    rateThisYear: r(0.97),
    avg2Rate: r(0.96),
    avg3Rate: avg3,
    avg5Rate: avg5,
    miscRate: null,
    lastYearRate: r(0.96),
    adoptKbn: adopt,
    thisYearRate: adopt === '1' ? avg3 : adopt === '2' ? avg5 : null,
    note: i % 7 === 0 ? '統合予定あり' : null,
  }
}

export function genChangeRates(count: number): InfantChangeRow[] {
  const list = schools()
  return Array.from({ length: count }, (_, i) => {
    const last = [0, 1, 2, 3, 4].map((age) => 30 + ((i + age) % 11))
    const now = [1, 2, 3, 4, 5].map((age) => 28 + ((i * 2 + age) % 13))
    return {
      ...genRateBase(i, list[i % list.length]!),
      lastYearAge0: last[0]!,
      lastYearAge1: last[1]!,
      lastYearAge2: last[2]!,
      lastYearAge3: last[3]!,
      lastYearAge4: last[4]!,
      lastYearTotal: last.reduce((a, b) => a + b, 0),
      thisYearAge1: now[0]!,
      thisYearAge2: now[1]!,
      thisYearAge3: now[2]!,
      thisYearAge4: now[3]!,
      thisYearAge5: now[4]!,
      thisYearTotal: now.reduce((a, b) => a + b, 0),
    }
  })
}

export function genEnrolRates(count: number): InfantEnrolRow[] {
  const list = schools()
  return Array.from({ length: count }, (_, i) => ({
    ...genRateBase(i, list[i % list.length]!),
    countAge5: 40 + (i % 12),
    students1: 38 + (i % 10),
  }))
}

/** One summary's saved result for one year. */
export interface Stored<T> {
  run: ExecuteInfo
  rows: T[]
}

function seed() {
  const year = new Date().getFullYear()
  const run = (): ExecuteInfo => ({
    executedAt: `${year}/04/01 09:30:00`,
    executedBy: 'Admin',
  })
  const stored = <T>(rows: T[]) => new Map<number, Stored<T>>([[year, { run: run(), rows }]])
  return {
    fumei: stored(genFumei(40)),
    summary1: stored(genSummary1(25)),
    summary2: stored(genSummary2(14)),
    summary3: stored(genSummary3(14)),
    anbunRegistered: stored(genAnbun(12)),
    routine: stored(genRoutine(15)),
    changeRates: stored(genChangeRates(20)),
    enrolRates: stored(genEnrolRates(20)),
  }
}

export const infantDb = seed()

export function resetInfantDb() {
  Object.assign(infantDb, seed())
}

export const generateInfant = {
  fumei: genFumei,
  summary1: genSummary1,
  summary2: genSummary2,
  summary3: genSummary3,
  anbun: genAnbun,
  routine: genRoutine,
  changeRates: genChangeRates,
  enrolRates: genEnrolRates,
}
