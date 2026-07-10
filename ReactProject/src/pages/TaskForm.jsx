import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { createNotification } from '../utils/notifications'
import toast from 'react-hot-toast'
import { apiUrl } from '../config/api'

export default function TaskForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [clients, setClients] = useState([])
  const [taskSubtasks, setTaskSubtasks] = useState([])

  const [subtasksText, setSubtasksText] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    assignee: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: ''
  })

  useEffect(() => {
    if (!user) return

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    }

    // Fetch Clients for dropdown
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          apiUrl('/api/clients?page=1&limit=1000'),
          config
        )

        setClients(response.data.clients || [])
      } catch (error) {
        console.error('Error fetching clients', error)
      }
    }

    // Fetch Task if Edit Mode
    const fetchTask = async () => {
      if (!isEditMode) return

      try {
        const response = await axios.get(
          apiUrl(`/api/tasks/${id}`),
          config
        )

        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          client: response.data.client?._id || '',
          assignee: response.data.assignee || '',
          priority: response.data.priority || 'Medium',
          status: response.data.status || 'Pending',
          dueDate: response.data.dueDate
            ? response.data.dueDate.substring(0, 10)
            : '',
        })
        setTaskSubtasks(response.data.subtasks || [])
        setSubtasksText(
          (response.data.subtasks || [])
            .map((s) => s.label)
            .join('\n')
        )

      } catch (error) {
        console.error('Error fetching task', error)
      }
    }

    fetchClients()
    fetchTask()

  }, [id, isEditMode, user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const subtasks = subtasksText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((label) => {
          const existing = taskSubtasks.find((s) => s.label === label)
          return { label, done: existing?.done || false }
        })

      const payload = {
        name: formData.name,
        description: formData.description,
        client: formData.client,
        assignee: formData.assignee,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        subtasks,
      }

      if (isEditMode) {
        await axios.put(
          apiUrl(`/api/tasks/${id}`),
          payload,
          config
        )
        await createNotification({
          title: 'Task updated',
          message: `${formData.name} was updated successfully.`,
          type: 'success',
          token: user?.token,
        })
        toast.success('Task updated')
        navigate(`/tasks/${id}`)
      } else {
        const response = await axios.post(
          apiUrl('/api/tasks'),
          payload,
          config
        )
        await createNotification({
          title: 'Task created',
          message: `${formData.name} was created successfully.`,
          type: 'success',
          token: user?.token,
        })
        toast.success('Task created')
        navigate(`/tasks/${response.data._id}`)
      }

    } catch (error) {
      console.error(error)
      await createNotification({
        title: 'Task save failed',
        message: 'Unable to save task. Please try again.',
        type: 'warning',
        token: user?.token,
      })
      toast.error('Failed to save task')
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">

      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Task Name
          </label>

          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border px-4"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Client
          </label>

          <select
            name="client"
            required
            value={formData.client}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border px-4"
          >
            <option value="">Select Client</option>

            {clients.map(client => (
              <option
                key={client._id}
                value={client._id}
              >
                {client.name}
              </option>
            ))}

          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">
            Description
          </label>

          <textarea
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border p-4"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Assignee
          </label>

          <input
            type="text"
            name="assignee"
            value={formData.assignee}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border px-4"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Due Date
          </label>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border px-4"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border px-4"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="h-11 w-full rounded-lg border px-4"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Subtasks (one per line)
          </label>
          <textarea
            rows="4"
            value={subtasksText}
            onChange={(e) => setSubtasksText(e.target.value)}
            placeholder={'Create wireframes\nDesign UI mockups\nUser flow diagrams'}
            className="w-full rounded-lg border border-[var(--color-border)] p-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex justify-end gap-3 sm:col-span-2">

          <Link
            to={isEditMode ? `/tasks/${id}` : '/tasks'}
            className="inline-flex h-10 items-center rounded-lg border border-[var(--color-border)] px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            {isEditMode ? 'Update Task' : 'Save Task'}
          </button>

        </div>

      </form>

    </div>
  )
}