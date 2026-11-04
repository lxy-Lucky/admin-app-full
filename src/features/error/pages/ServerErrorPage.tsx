import { useRouteError } from 'react-router'
import { ResultPage } from '@/shared/components'

/** Used both as the `/500` page and as the router `errorElement`. */
export default function ServerErrorPage() {
  const error = useRouteError()
  const detail = import.meta.env.DEV && error ? String(error) : undefined
  return <ResultPage status="500" detail={detail} />
}
