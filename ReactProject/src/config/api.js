/**
 * Central API configuration.
 * - Local: `.env.development` → http://localhost:5000
 * - Vercel/production: `.env.production` or Vercel env var `VITE_API_URL`
 *   (must be the Render API URL, not localhost)
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://crm-dashboard-bbaq.onrender.com'
    : 'http://localhost:5000')
).replace(/\/$/, '')

export function apiUrl(path = '') {
  if (!path) return API_BASE
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}
