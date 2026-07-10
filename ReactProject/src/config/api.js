/**
 * Central API configuration.
 * Set VITE_API_URL in .env (e.g. http://localhost:5000 or your production URL).
 */
export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export function apiUrl(path = '') {
  if (!path) return API_BASE
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}
