import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { createNotification } from '../utils/notifications'
import toast from 'react-hot-toast'

export default function ClientForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    company: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    if (isEditMode) {
      const fetchClient = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user?.token}` } }
          const response = await axios.get(`http://localhost:5000/api/clients/${id}`, config)
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            status: response.data.status || 'Active',
            company: response.data.company || '',
            industry: response.data.industry || '',
            companySize: response.data.companySize || '',
            website: response.data.website || '',
            address: response.data.address || '',
            notes: response.data.notes || '',
          })
        } catch (error) {
          console.error('Error fetching client data', error)
        }
      }
      fetchClient()
    }
  }, [id, isEditMode, user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } }
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        company: formData.company,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website,
        address: formData.address,
        notes: formData.notes,
      }

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/clients/${id}`, payload, config)
        await createNotification({
          title: 'Client updated',
          message: `${formData.name} was updated successfully.`,
          type: 'success',
          token: user?.token,
        })
        toast.success('Client updated')
        navigate(`/clients/${id}`)
      } else {
        const response = await axios.post('http://localhost:5000/api/clients', payload, config)
        await createNotification({
          title: 'Client created',
          message: `${formData.name} was created successfully.`,
          type: 'success',
          token: user?.token,
        })
        toast.success('Client created')
        navigate(`/clients/${response.data._id}`)
      }
    } catch (error) {
      console.error('Error saving client', error)
      await createNotification({
        title: 'Client save failed',
        message: 'Unable to save client. Please try again.',
        type: 'warning',
        token: user?.token,
      })
      toast.error('Failed to save client')
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Client Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Industry</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Select industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Research">Research</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="www.example.com"
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="City, Country"
            className="h-11 w-full rounded-lg border border-[var(--color-border)] px-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Link
            to={isEditMode ? `/clients/${id}` : '/clients'}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            {isEditMode ? 'Update Client' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  )
}
