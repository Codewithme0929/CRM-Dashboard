import { useState, useEffect, useContext } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Filter,Eye, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import Badge from '../components/Badge'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'
import { SearchContext } from "../context/SearchContext";
import { createNotification } from '../utils/notifications'
import toast from 'react-hot-toast'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false);
  const [highlightId, setHighlightId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTasks , setTotalTasks] = useState(0)
  const [limit,setLimit] = useState(5)

  const { user } = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }

        const response = await axios.get(
          `http://localhost:5000/api/tasks?page=${page}&limit=${limit}&search=${searchTerm}`,
          config
        )

        setTasks(response.data.tasks || [])
        setTotalPages(response.data.totalPages || 1)
        setTotalTasks(response.data.totalTasks || 1)

      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
      finally{
        setLoading(false);
      }
    }

    if (user) {
      fetchTasks()
    }
  }, [user, page, limit , searchTerm])

  useEffect(() => {
    const focus = searchParams.get('focus')
    if (!focus) return

    setHighlightId(focus)
    const t = window.setTimeout(() => {
      const row = document.querySelector(`[data-task-row-id="${focus}"]`)
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 0)

    const clear = window.setTimeout(() => setHighlightId(null), 2500)

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('focus')
      return next
    }, { replace: true })

    return () => {
      window.clearTimeout(t)
      window.clearTimeout(clear)
    }
  }, [searchParams, setSearchParams])

  const initiateDelete = (id) => {
    setTaskToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      }

      const deleted = tasks.find((t) => t._id === taskToDelete)
      await axios.delete(
        `http://localhost:5000/api/tasks/${taskToDelete}`,
        config
      )

      setTasks(tasks.filter(task => task._id !== taskToDelete))
      setIsDeleteModalOpen(false)
      setTaskToDelete(null)
      await createNotification({
        title: 'Task deleted',
        message: deleted?.name ? `${deleted.name} was deleted.` : 'Task was deleted.',
        type: 'warning',
        token: user?.token,
      })
      toast.success('Task deleted')

    } catch (error) {
      console.error(error)
      await createNotification({
        title: 'Task delete failed',
        message: 'Unable to delete task. Please try again.',
        type: 'warning',
        token: user?.token,
      })
      toast.error('Failed to delete task')
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

return (
  <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Search Tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <Link
        to="/tasks/new"
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </Link>
    </div>

    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">

      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3.5">Task Name</th>
            <th className="px-5 py-3.5">Client</th>
            <th className="px-5 py-3.5">Assignee</th>
            <th className="px-5 py-3.5">Priority</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Due Date</th>
            <th className="px-5 py-3.5">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
    {loading ? (<tr>
        <td colSpan="5">
          <Loader />
        </td>
      </tr>): tasks.length > 0 ? (tasks.map((task) => (

            <tr
              key={task._id}
              data-task-row-id={task._id}
              className={`hover:bg-slate-50/80 transition-colors ${highlightId === task._id ? 'bg-indigo-50' : ''}`}
            >
              <td className="px-5 py-4 font-medium text-slate-900">
                <Link
                  to={`/tasks/${task._id}`}
                  className="hover:text-[var(--color-primary)]"
                >
                  {task.name}
                </Link>
              </td>

              <td className="px-5 py-4 text-slate-600">
                {task.client?.name || (
                  <span className="italic text-slate-400">
                    No Client
                  </span>
                )}
              </td>

              <td className="px-5 py-4 text-slate-600">
                {task.assignee || (
                  <span className="italic text-slate-400">
                    Unassigned
                  </span>
                )}
              </td>

              <td className="px-5 py-4">
                <Badge tone={task.priority}>
                  {task.priority}
                </Badge>
              </td>

              <td className="px-5 py-4">
                <Badge tone={task.status}>
                  {task.status}
                </Badge>
              </td>

              <td className="px-5 py-4 text-slate-600">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : (
                    <span className="italic text-slate-400">
                      No Due Date
                    </span>
                  )}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-2">

                  <Link
                    to={`/tasks/edit/${task._id}`}
                    className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[var(--color-primary)]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/tasks/${task._id}`}
                    className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[var(--color-primary)]"
                  >
                   <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => initiateDelete(task._id)}
                    className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              </td>

            </tr>

          )))
          :( <tr>
              <td
                colSpan="7"
                className="px-5 py-10 text-center text-slate-500"
              >
                No Tasks Found
              </td>
            </tr>)
        }
        </tbody>
      </table>

     <Pagination
    page={page}
    totalPages={totalPages}
    totalItems={totalTasks}
    limit={limit}
    setLimit={setLimit}
    onPageChange={setPage}
/>
    </div>

    {isDeleteModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-xl">

          <h3 className="text-lg font-semibold text-slate-900">
            Delete Task
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setTaskToDelete(null)
              }}
              className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex h-10 items-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>

          </div>

        </div>
      </div>
    )}
  </>
)
}