import { Activity } from 'lucide-react'

const actionColors = {
  created: 'bg-emerald-50 text-emerald-700',
  updated: 'bg-blue-50 text-blue-700',
  deleted: 'bg-red-50 text-red-700',
  note_added: 'bg-amber-50 text-amber-700',
  note_deleted: 'bg-amber-50 text-amber-700',
  comment_added: 'bg-violet-50 text-violet-700',
  comment_deleted: 'bg-violet-50 text-violet-700',
  file_uploaded: 'bg-cyan-50 text-cyan-700',
  file_deleted: 'bg-cyan-50 text-cyan-700',
  subtask_updated: 'bg-indigo-50 text-indigo-700',
}

function formatAction(action) {
  return action.replace(/_/g, ' ')
}

export default function ActivityTab({ activities }) {
  if (!activities.length) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
        <Activity className="mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">No activity recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <ul className="relative space-y-0">
        {activities.map((item, index) => (
          <li key={item._id} className="relative flex gap-4 pb-8">
            {index < activities.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-slate-200" />
            )}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100">
              <Activity className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    actionColors[item.action] || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {formatAction(item.action)}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{item.message}</p>
              {item.user?.name && (
                <p className="mt-1 text-xs text-slate-500">by {item.user.name}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
