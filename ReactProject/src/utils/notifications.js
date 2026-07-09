import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export async function createNotification({ title, message, type = 'info', token }) {
  try {
    await axios.post(
      `${API_BASE}/api/notifications`,
      { title, message, type },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    )
  } catch {
    // notifications should never break core flows
  }
}

