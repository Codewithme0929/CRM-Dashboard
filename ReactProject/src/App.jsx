import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/ClientList'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientForm from './pages/ClientForm'
import ClientDetail from './pages/ClientDetail'
import TaskList from './pages/TaskList'
import TaskForm from './pages/TaskForm'
import TaskDetail from './pages/TaskDetail'
import { SearchProvider } from "./context/SearchContext";
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <SearchProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/edit/:id" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/tasks/edit/:id" element={<TaskForm />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </SearchProvider>
  )
}
