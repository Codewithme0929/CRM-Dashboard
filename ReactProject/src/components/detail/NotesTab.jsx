import { useState } from 'react'
import axios from 'axios'
import { Trash2, StickyNote } from 'lucide-react'

export default function NotesTab({ clientId, notes, onRefresh, token, apiBase }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      setSubmitting(true)
      await axios.post(`${apiBase}/api/clients/${clientId}/notes`, { text }, config)
      setText('')
      onRefresh()
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return

    try {
      await axios.delete(`${apiBase}/api/clients/${clientId}/notes/${noteId}`, config)
      onRefresh()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleAdd} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Add a note</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write a note about this client..."
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="mt-3 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Add Note'}
        </button>
      </form>

      {notes.length > 0 ? (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note._id}
              className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <StickyNote className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-slate-700">{note.text}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {note.user?.name || 'User'} ·{' '}
                  {new Date(note.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note._id)}
                className="shrink-0 text-slate-400 hover:text-red-500"
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No notes yet. Add the first note above.</p>
      )}
    </div>
  )
}
