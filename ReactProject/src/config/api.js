/**
 * Central API configuration.
 * - Local dev: http://localhost:5000
 * - Production/Vercel: Render API (never localhost)
 */
const RENDER_API = 'https://crm-dashboard-bbaq.onrender.com'
const LOCAL_API = 'http://localhost:5000'

function resolveApiBase() {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  const isLocal =
    !configured ||
    /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)

  if (import.meta.env.PROD) {
    // Never ship a production build that talks to localhost
    return isLocal ? RENDER_API : configured
  }

  return configured || LOCAL_API
}

export const API_BASE = resolveApiBase()

export function apiUrl(path = '') {
  if (!path) return API_BASE
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}
