import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

function getPageTitle(pathname) {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/clients') return 'Clients'
  if (pathname === '/clients/new') return 'Add Client'
  if (pathname.startsWith('/clients/edit/')) return 'Edit Client'
  if (/^\/clients\/[^/]+$/.test(pathname)) return 'Client Details'
  if (pathname === '/tasks') return 'Tasks'
  if (pathname === '/tasks/new') return 'Add Task'
  if (pathname.startsWith('/tasks/edit/')) return 'Edit Task'
  if (/^\/tasks\/[^/]+$/.test(pathname)) return 'Task Details'
  if (pathname === '/notifications') return 'Notifications'
  if (pathname === '/settings') return 'Settings'
  return 'TaskPro'
}

export default function DashboardLayout() {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
