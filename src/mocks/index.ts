import { env } from '@/shared/config/env'

/**
 * Starts the MSW service worker in dev when VITE_USE_MOCK=true.
 * The `import.meta.env.DEV` guard lets Vite drop the whole mock tree from production builds.
 */
export async function enableMocking() {
  if (!import.meta.env.DEV || !env.VITE_USE_MOCK) return
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
  console.warn('[mock] MSW enabled')
}
