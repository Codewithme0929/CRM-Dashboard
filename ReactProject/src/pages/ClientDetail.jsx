import { useContext, useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Pencil,
  MoreVertical,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import NotesTab from '../components/detail/NotesTab'
import FilesTab from '../components/detail/FilesTab'
import ActivityTab from '../components/detail/ActivityTab'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const tabs = ['Overview', 'Tasks', 'Notes', 'Files', 'Activity']

export default function ClientDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)

  const [client, setClient] = useState(null)
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [files, setFiles] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  const config = { headers: { Authorization: `Bearer ${user?.token}` } }

  const fetchTabData = useCallback(async (tab) => {
    if (!user?.token || !id) return

    try {
      if (tab === 'Notes') {
        const res = await axios.get(`${API_BASE}/api/clients/${id}/notes`, config)
        setNotes(res.data.notes || [])
      } else if (tab === 'Files') {
        const res = await axios.get(`${API_BASE}/api/clients/${id}/files`, config)
        setFiles(res.data.files || [])
      } else if (tab === 'Activity') {
        const res = await axios.get(`${API_BASE}/api/clients/${id}/activity`, config)
        setActivities(res.data.activities || [])
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error)
    }
  }, [id, user?.token])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token || !id) return

      try {
        setLoading(true)

        const [clientRes, tasksRes] = await Promise.all([
          axios.get(`${API_BASE}/api/clients/${id}`, config),
          axios.get(`${API_BASE}/api/tasks?client=${id}&limit=100`, config),
        ])

        setClient(clientRes.data)
        setTasks(tasksRes.data.tasks || [])
      } catch (error) {
        console.error('Error fetching client detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user?.token])

  useEffect(() => {
    if (['Notes', 'Files', 'Activity'].includes(activeTab)) {
      fetchTabData(activeTab)
    }
  }, [activeTab, fetchTabData])

  const refreshNotes = () => fetchTabData('Notes')
  const refreshFiles = () => fetchTabData('Files')
  const refreshActivity = () => fetchTabData('Activity')

  if (loading) {
    return <Loader />
  }

  if (!client) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Client not found.</p>
        <Link to="/clients" className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]">
          Back to Clients
        </Link>
      </div>
    )
  }

  const createdOn = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="space-y-6">
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[var(--color-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
              <Badge tone={client.status}>{client.status}</Badge>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {client.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                {client.phone || 'No phone'}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {client.address || 'No location'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/clients/edit/${client._id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
            >
              <Pencil className="h-4 w-4" />
              Edit Client
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-slate-500 hover:bg-slate-50"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab === 'Tasks' && ` (${tasks.length})`}
              {tab === 'Notes' && ` (${notes.length})`}
              {tab === 'Files' && ` (${files.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                About Client
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Industry</dt>
                  <dd className="font-medium text-slate-900">{client.industry || '—'}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">Website</dt>
                  <dd className="font-medium text-slate-900">
                    {client.website ? (
                      <a
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {client.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                {client.notes && (
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Profile Notes</dt>
                    <dd className="mt-1 font-medium text-slate-900">{client.notes}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Created On</dt>
                  <dd className="font-medium text-slate-900">{createdOn}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent Tasks
              </h3>
              <ul className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <li
                      key={task._id}
                      className="flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 shadow-sm"
                    >
                      <Link
                        to={`/tasks/${task._id}`}
                        className="font-medium text-slate-900 hover:text-[var(--color-primary)]"
                      >
                        {task.name}
                      </Link>
                      <Badge tone={task.status}>{task.status}</Badge>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No tasks yet for this client.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="mt-6">
            {tasks.length > 0 ? (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {tasks.map((task) => (
                  <li key={task._id} className="flex items-center justify-between px-4 py-4">
                    <div>
                      <Link
                        to={`/tasks/${task._id}`}
                        className="font-medium text-slate-900 hover:text-[var(--color-primary)]"
                      >
                        {task.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.assignee || 'Unassigned'}
                        {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge tone={task.status}>{task.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No tasks for this client yet.</p>
            )}
          </div>
        )}

        {activeTab === 'Notes' && (
          <NotesTab
            clientId={id}
            notes={notes}
            onRefresh={() => {
              refreshNotes()
              refreshActivity()
            }}
            token={user?.token}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'Files' && (
          <FilesTab
            entityType="client"
            entityId={id}
            files={files}
            onRefresh={() => {
              refreshFiles()
              refreshActivity()
            }}
            token={user?.token}
            apiBase={API_BASE}
          />
        )}

        {activeTab === 'Activity' && <ActivityTab activities={activities} />}
      </div>
    </div>
  )
}
