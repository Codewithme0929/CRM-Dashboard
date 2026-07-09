const tones = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Inactive: 'bg-red-50 text-red-700 ring-red-600/20',
  High: 'bg-red-50 text-red-700 ring-red-600/20',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

export default function Badge({ children, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone] || 'bg-slate-50 text-slate-700 ring-slate-600/20'}`}>
      {children}
    </span>
  )
}
