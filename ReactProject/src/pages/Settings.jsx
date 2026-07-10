import { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import Loader from '../components/Loader'
import { apiUrl } from '../config/api'

function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-5 last:border-0">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { user, logout, updateUser } = useContext(AuthContext)

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [profile, setProfile] = useState({ name: '', email: '', role: 'Admin' })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const initials = useMemo(() => {
    const name = profile.name || user?.name || 'User'
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [profile.name, user?.name])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) return

      try {
        setLoading(true)
        const response = await axios.get(apiUrl('/api/users/profile'), {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        setProfile({
          name: response.data.name || '',
          email: response.data.email || '',
          role: response.data.role || 'Admin',
        })
      } catch (error) {
        console.error(error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.token])

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!profile.name.trim()) {
      toast.error('Name is required')
      return
    }

    try {
      setSavingProfile(true)
      const response = await axios.put(
        apiUrl('/api/users/profile'),
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )

      setProfile({
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'Admin',
      })
      updateUser({
        name: response.data.name,
        email: response.data.email,
      })
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setSavingPassword(true)
      await axios.put(
        apiUrl('/api/users/password'),
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{profile.name}</p>
            <p className="truncate text-sm text-slate-500">{profile.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Update your account information.</p>

        <form onSubmit={handleProfileSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={profile.name}
              onChange={handleProfileChange}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              required
              value={profile.email}
              onChange={handleProfileChange}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Security</h2>
        <p className="mt-1 text-sm text-slate-500">Change your password.</p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <SettingRow label="Account" description="Sign out of your account on this device.">
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </SettingRow>
        </div>
      </div>
    </div>
  )
}
