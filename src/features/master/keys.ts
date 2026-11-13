import { createQueryKeys } from '@/shared/request'

export const jukiKeys = createQueryKeys('master-juki')
export const areaKeys = createQueryKeys('master-area')
export const schoolKeys = createQueryKeys('master-schools')
export const wardKeys = createQueryKeys('master-wards')
export const gakusekiKeys = {
  ...createQueryKeys('master-gakuseki'),
  status: (year: number) => ['master-gakuseki', 'status', year] as const,
}
