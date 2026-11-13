/** Result of every import endpoint. */
export interface ImportResult {
  /** Number of rows imported. */
  count: number
}

export interface YearFilter {
  year: number
}

/** 住民基本台帳DB */
export interface JukiRecord {
  id: number
  /** 1 = Japanese, 2 = foreign resident */
  residentsKbn: string
  wardCode: string
  birthDate: string
  cityName: string
  azaName: string
  banchigou: string
  katagaki: string
  machiazaCode: string
  branchNum: string
}

/** 学区域情報 */
export interface AreaRecord {
  id: number
  wardCode: string
  townCode: string
  azaCode: string
  /** Four banchi code parts. */
  banchiFrom: string[]
  banchiTo: string[]
  shiteikou1: string
  shiteikou2: string
  tokuchoKbn: string
  tokuchoKou1: string
  tokuchoKou2: string
}

export type SchoolKbn = '1' | '5'

/** 学校マスタ */
export interface School {
  id: number
  /** 1 = elementary, 5 = junior high */
  schoolKbn: SchoolKbn
  wardCode: string
  wardNm: string
  schoolNm: string
  schoolNmKana: string
  codePre: string
  codeCity: string
  codeGov: string
  tel: string
  address: string
  note: string
  closed: boolean
}

export interface SchoolFilter extends YearFilter {
  schoolKbn?: SchoolKbn
  wardCodes?: string[]
  schoolNmKana?: string
  closedOnly?: boolean
}

export interface Ward {
  wardCode: string
  wardNm: string
}

export type GakusekiKbn = '1' | '2'

/** 学籍DB */
export interface GakusekiRecord {
  id: number
  wardCode: string
  wardNm: string
  shiteikouCode: string
  grade: number
  age: number
  personName: string
  addressDetail: string
  katagaki: string
  areaKbn: string
  townCode: string
  azaCode: string
  banchi: string[]
}

export interface GakusekiFilter extends YearFilter {
  kbn: GakusekiKbn
}

export interface GakusekiWardStatus extends Ward {
  imported: boolean
}

export interface GakusekiKbnStatus {
  /** True when every ward is imported. */
  complete: boolean
  wards: GakusekiWardStatus[]
}

export interface GakusekiStatus {
  elem: GakusekiKbnStatus
  jhs: GakusekiKbnStatus
}
