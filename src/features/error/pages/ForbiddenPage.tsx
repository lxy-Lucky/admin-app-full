import { ResultPage } from '@/shared/components'

export default function ForbiddenPage({ fullPage = true }: { fullPage?: boolean }) {
  return <ResultPage status="403" fullPage={fullPage} />
}
