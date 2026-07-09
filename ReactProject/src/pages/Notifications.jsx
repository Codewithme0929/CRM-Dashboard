import { useContext, useMemo, useState } from 'react'
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2, Check } from 'lucide-react'
import { useEffect } from "react";
import axios from "axios";
import { AuthContext } from '../context/AuthContext'

function ToneIcon({ tone }) {
  if (tone === 'success') return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  if (tone === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-600" />
  return <Info className="h-5 w-5 text-blue-600" />
}

function ToneDot({ tone }) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-500'
      : tone === 'warning'
      ? 'bg-amber-500'
      : 'bg-blue-500'
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cls}`} />
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all') // all | unread (UI only)
  const { user } = useContext(AuthContext)

  const filtered = useMemo(() => {

      if(filter==="unread")
          return items.filter(n => !n.isRead);

      return items;

  }, [items, filter]);
  useEffect(() => {

      const fetchNotifications = async () => {

          try {

              const response = await axios.get("http://localhost:5000/api/notifications", {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { page: 1, limit: 50 },
              });

              setItems(response.data?.notifications || []);

          } catch (err) {

              console.log(err);

          }

      };

      if (user?.token) fetchNotifications();

  }, [user?.token]);

  const markRead = async (id) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/notifications/${id}`,
        { isRead: true },
        user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : undefined
      )
      setItems((prev) => prev.map((n) => (n._id === id ? response.data : n)))
    } catch (err) {
      console.log(err)
    }
  }

  const clearAll = async () => {
    try {
      await axios.delete(
        "http://localhost:5000/api/notifications",
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setItems([])
    } catch (err) {
      console.log(err)
    }
  }
  
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[var(--color-primary)]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">Master plan UI: alerts, validations, and events.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`h-10 rounded-lg px-4 text-sm font-semibold ${
                filter === 'all'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border)] bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`h-10 rounded-lg px-4 text-sm font-semibold ${
                filter === 'unread'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border)] bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No notifications</h3>
            <p className="mt-1 text-sm text-slate-500">You’re all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((n) => (
              <li key={n._id} className="p-5 hover:bg-slate-50/60">
                <div className="flex items-start gap-3">
                  <ToneDot tone={n.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ToneIcon tone={n.type} />
                        <p className="truncate text-sm font-semibold text-slate-900">{n.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => markRead(n._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark read
                          </button>
                        )}
                        <span className="shrink-0 text-xs text-slate-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

