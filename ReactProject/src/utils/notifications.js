import axios from 'axios'

import { apiUrl } from '../config/api'

export async function createNotification({ title, message, type = 'info', token }) {
  try {
    await axios.post(
      `${apiUrl('/api/notifications')}`,
      { title, message, type },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    )
  } catch {
    // notifications should never break core flows
  }
}

  