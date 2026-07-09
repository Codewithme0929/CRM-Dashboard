import { useState } from 'react'
import axios from 'axios'
import { Trash2, MessageSquare } from 'lucide-react'

export default function CommentsTab({ taskId, comments, onRefresh, token, apiBase }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      setSubmitting(true)
      await axios.post(`${apiBase}/api/tasks/${taskId}/comments`, { text }, config)
      setText('')
      onRefresh()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      await axios.delete(`${apiBase}/api/tasks/${taskId}/comments/${commentId}`, config)
      onRefresh()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleAdd} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Add a comment</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write a comment on this task..."
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="mt-3 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment._id}
              className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                {(comment.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {comment.user?.name || 'User'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{comment.text}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(comment._id)}
                className="shrink-0 text-slate-400 hover:text-red-500"
                title="Delete comment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <MessageSquare className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No comments yet. Start the discussion above.</p>
        </div>
      )}
    </div>
  )
}
