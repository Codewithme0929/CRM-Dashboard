import { useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Pencil,
  MoreVertical,
  Building2,
  User,
  Calendar,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import Badge from '../components/Badge'
import Loader from '../components/Loader'
import CommentsTab from '../components/detail/CommentsTab'
import FilesTab from '../components/detail/FilesTab'
import ActivityTab from '../components/detail/ActivityTab'

import { apiUrl } from '../config/api'

const tabs = ['Overview', 'Subtasks', 'Comments', 'Files', 'Activity']

export default function TaskDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)

  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [files, setFiles] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  const config = { headers: { Authorization: `Bearer ${user?.token}` } }

  const fetchTask = async () => {
    if (!user?.token || !id) return

    try {
      setLoading(true)
      const response = await axios.get(apiUrl(`/api/tasks/${id}`), config)
      setTask(response.data)
    } catch (error) {
      console.error('Error fetching task detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTabData = useCallback(async (tab) => {
    if (!user?.token || !id) return

    try {
      if (tab === 'Comments') {
        const res = await axios.get(apiUrl(`/api/tasks/${id}/comments`), config)
        setComments(res.data.comments || [])
      } else if (tab === 'Files') {
        const res = await axios.get(apiUrl(`/api/tasks/${id}/files`), config)
        setFiles(res.data.files || [])
      } else if (tab === 'Activity') {
        const res = await axios.get(apiUrl(`/api/tasks/${id}/activity`), config)
        setActivities(res.data.activities || [])
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error)
    }
  }, [id, user?.token])

  useEffect(() => {
    fetchTask()
  }, [id, user?.token])

  useEffect(() => {
    if (['Comments', 'Files', 'Activity'].includes(activeTab)) {
      fetchTabData(activeTab)
    }
  }, [activeTab, fetchTabData])

  const subtasks = task?.subtasks || []
  const doneCount = subtasks.filter((s) => s.done).length
  const progress = subtasks.length ? Math.round((doneCount / subtasks.length) * 100) : 0

  const dueDateLabel = useMemo(() => {
    if (!task?.dueDate) return 'No due date'
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [task?.dueDate])

  const toggleSubtask = async (subtaskId, currentDone) => {
    try {
      const response = await axios.patch(
        apiUrl(`/api/tasks/${id}/subtasks/${subtaskId}`),
        { done: !currentDone },
        config
      )
      setTask(response.data)
      fetchTabData('Activity')
    } catch (error) {
      console.error('Error updating subtask:', error)
    }
  }

  const refreshComments = () => fetchTabData('Comments')
  const refreshFiles = () => fetchTabData('Files')
  const refreshActivity = () => fetchTabData('Activity')

  if (loading) {
    return <Loader />
  }

  if (!task) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-10 text-center shadow-sm">
        <p className="text-slate-500">Task not found.</p>
        <Link to="/tasks" className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]">
          Back to Tasks
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[var(--color-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{task.name}</h2>
              <Badge tone={task.status}>{task.status}</Badge>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                Client:{' '}
                <strong className="text-slate-700">
                  {task.client?.name ? (
                    <Link
                      to={`/clients/${task.client._id}`}
                      className="hover:text-[var(--color-primary)]"
                    >
                      {task.client.name}
                    </Link>
                  ) : (
                    'No Client'
                  )}
                </strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Assignee:{' '}
                <strong className="text-slate-700">{task.assignee || 'Unassigned'}</strong>
              </span>
              <span className="inline-flex items-center gap-2">
                Priority: <Badge tone={task.priority}>{task.priority}</Badge>
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Due: <strong className="text-slate-700">{dueDateLabel}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/tasks/edit/${task._id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
            >
              <Pencil className="h-4 w-4" />
              Edit Task
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
              {tab === 'Subtasks' && ` (${subtasks.length})`}
              {tab === 'Comments' && ` (${comments.length})`}
              {tab === 'Files' && ` (${files.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Subtasks Progress
                </h3>
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  {progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {doneCount} of {subtasks.length} subtasks completed
              </p>

              <ul className="mt-4 space-y-2">
                {subtasks.length > 0 ? (
                  subtasks.map((sub) => (
                    <li key={sub._id} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={() => toggleSubtask(sub._id, sub.done)}
                        className="rounded border-slate-300 text-[var(--color-primary)]"
                      />
                      <span className={sub.done ? 'text-slate-400 line-through' : 'text-slate-700'}>
                        {sub.label}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No subtasks yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'Subtasks' && (
          <div className="mt-6">
            {subtasks.length > 0 ? (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {subtasks.map((sub) => (
                  <li key={sub._id} className="flex items-center gap-3 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={sub.done}
                      onChange={() => toggleSubtask(sub._id, sub.done)}
                      className="rounded border-slate-300 text-[var(--color-primary)]"
                    />
                    <span className={sub.done ? 'text-slate-400 line-through' : 'text-slate-900'}>
                      {sub.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No subtasks for this task yet.</p>
            )}
          </div>
        )}

        {activeTab === 'Comments' && (
          <CommentsTab
            taskId={id}
            comments={comments}
            onRefresh={() => {
              refreshComments()
              refreshActivity()
            }}
            token={user?.token}
          />
        )}

        {activeTab === 'Files' && (
          <FilesTab
            entityType="task"
            entityId={id}
            files={files}
            onRefresh={() => {
              refreshFiles()
              refreshActivity()
            }}
            token={user?.token}
          />
        )}

        {activeTab === 'Activity' && <ActivityTab activities={activities} />}
      </div>
    </div>
  )
}

