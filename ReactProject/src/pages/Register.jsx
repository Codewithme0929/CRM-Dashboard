import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import { apiUrl } from '../config/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)

  const { login } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await axios.post(apiUrl('/api/auth/register'), {
        name,
        email,
        password,
      })
      login(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account')
    }
  }

  return (
    <AuthLayout
      heading="Get Started Today!"
      subheading="Create your account and start managing clients, tasks, and projects with ease."
    >
      <h1 className="text-3xl font-bold text-slate-900">Sign Up</h1>
      <p className="mt-2 text-slate-500">Create your account to get started</p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 pr-11 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="h-11 w-full rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}
