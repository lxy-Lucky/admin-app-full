import dayjs from 'dayjs'
import type {
  AreaRecord,
  GakusekiKbn,
  GakusekiRecord,
  JukiRecord,
  School,
  Ward,
} from '@/features/master/types'

export const wards: Ward[] = [
  { wardCode: '01', wardNm: '鶴見区' },
  { wardCode: '02', wardNm: '神奈川区' },
  { wardCode: '03', wardNm: '西区' },
  { wardCode: '04', wardNm: '中区' },
  { wardCode: '05', wardNm: '南区' },
  { wardCode: '06', wardNm: '港南区' },
]

const towns = ['本町', '中央', '緑ヶ丘', '桜木町', '港町']
const familyNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村']
const givenNames = ['太郎', '花子', '一郎', '美咲', '健太', '結衣', '大輔', '陽菜']
const pad = (n: number, len: number) => String(n).padStart(len, '0')

function genJuki(count: number): JukiRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const ward = wards[i % wards.length]!
    return {
      id: i + 1,
      residentsKbn: i % 7 === 0 ? '2' : '1',
      wardCode: `14${ward.wardCode}`,
      birthDate: dayjs('2020-04-02')
        .add(i * 13, 'day')
        .format('YYYY-MM-DD'),
      cityName: `横浜市${ward.wardNm}`,
      azaName: `${towns[i % towns.length]}${(i % 4) + 1}丁目`,
      banchigou: `${(i % 30) + 1}-${(i % 9) + 1}`,
      katagaki: i % 3 === 0 ? `ハイツ${(i % 9) + 1}0${(i % 4) + 1}` : '',
      machiazaCode: String(1000 + (i % 50)),
      branchNum: String((i % 9) + 1),
    }
  })
}

function genArea(count: number): AreaRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const special = i % 6 === 0
    return {
      id: i + 1,
      wardCode: wards[i % wards.length]!.wardCode,
      townCode: pad((i % 40) + 1, 3),
      azaCode: pad(i % 5, 2),
      banchiFrom: [pad((i * 3) % 90, 5), '00000', '00000', '00000'],
      banchiTo: [pad(((i * 3) % 90) + 2, 5), '00000', '00000', '00000'],
      shiteikou1: `00${100 + (i % 20)}`,
      shiteikou2: i % 4 === 0 ? `00${120 + (i % 10)}` : '',
      tokuchoKbn: special ? '1' : '0',
      tokuchoKou1: special ? `00${130 + (i % 5)}` : '',
      tokuchoKou2: '',
    }
  })
}

function genSchools(count: number): School[] {
  return Array.from({ length: count }, (_, i) => {
    const ward = wards[i % wards.length]!
    const junior = i % 3 === 2
    return {
      id: i + 1,
      schoolKbn: junior ? '5' : '1',
      wardCode: ward.wardCode,
      wardNm: ward.wardNm,
      schoolNm: `${ward.wardNm.replace('区', '')}第${i + 1}${junior ? '中学校' : '小学校'}`,
      schoolNmKana: `ダイ${i + 1}${junior ? 'チュウ' : 'ショウ'}ガッコウ`,
      codePre: `14${1000 + i}`,
      codeCity: String(200 + i),
      codeGov: `B1${1000 + i}`,
      tel: `045-000-${1000 + i}`,
      address: `横浜市${ward.wardNm}${towns[i % towns.length]}${i + 1}-1`,
      note: '',
      closed: i % 11 === 10,
    }
  })
}

function genGakuseki(ward: Ward, wardIndex: number, kbn: GakusekiKbn): GakusekiRecord[] {
  const grades = kbn === '1' ? 6 : 3
  const baseAge = kbn === '1' ? 6 : 12
  return Array.from({ length: 12 }, (_, i) => {
    const grade = (i % grades) + 1
    return {
      id: wardIndex * 1000 + i + 1,
      wardCode: ward.wardCode,
      wardNm: ward.wardNm,
      shiteikouCode: `00${100 + ((i + wardIndex) % 20)}`,
      grade,
      age: baseAge + grade - 1,
      personName: `${familyNames[(i + wardIndex) % familyNames.length]} ${givenNames[(i * 3 + wardIndex) % givenNames.length]}`,
      addressDetail: `${ward.wardNm}${towns[i % towns.length]}${(i % 4) + 1}-${(i % 20) + 1}`,
      katagaki: i % 4 === 0 ? `コーポ${(i % 5) + 1}0${(i % 3) + 1}` : '',
      areaKbn: i % 5 === 0 ? '2' : '1',
      townCode: pad((i % 40) + 1, 3),
      azaCode: pad(i % 5, 2),
      banchi: [pad(i * 3, 5), '00000', '00000', '00000'],
    }
  })
}

/** Rows a mock import produces; the real backend would parse the uploaded file instead. */
export const MOCK_IMPORT_ROWS = { juki: 80, area: 60, schools: 24 }

/** Gakuseki data lives per `year:kbn`, per ward (a ward is "imported" once it has rows). */
type GakusekiByWard = Record<string, GakusekiRecord[]>

function seed() {
  const year = new Date().getFullYear()
  const gakuseki = new Map<string, GakusekiByWard>()
  const kbns: [GakusekiKbn, number][] = [
    ['1', 4],
    ['2', 2],
  ]
  for (const [kbn, importedWards] of kbns) {
    const byWard: GakusekiByWard = {}
    wards.slice(0, importedWards).forEach((ward, i) => {
      byWard[ward.wardCode] = genGakuseki(ward, i, kbn)
    })
    gakuseki.set(`${year}:${kbn}`, byWard)
  }
  return {
    juki: new Map<number, JukiRecord[]>([[year, genJuki(120)]]),
    area: new Map<number, AreaRecord[]>([[year, genArea(80)]]),
    schools: new Map<number, School[]>([[year, genSchools(30)]]),
    gakuseki,
  }
}

export const masterDb = seed()

export function resetMasterDb() {
  Object.assign(masterDb, seed())
}

export const generate = { juki: genJuki, area: genArea, schools: genSchools, gakuseki: genGakuseki }
