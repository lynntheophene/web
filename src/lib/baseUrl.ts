// Prefer a relative base in the browser; on server/build use SITE or dev localhost
let base = ''

if (typeof window === 'undefined') {
  // SSR/build
  const site = import.meta.env.SITE?.replace(/\/$/, '')
  if (site) {
    base = site
  } else if (import.meta.env.DEV) {
    base = 'http://localhost:4321'
  }
}

export const BASE_URL = base || ''
