import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { Users, CheckSquare, CheckCircle2, Clock } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function StatCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-indigo-50 p-2.5 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={`text-xs font-medium ${
            trendUp ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {trend}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  )
}
function TasksChart({ data }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Weekly Task Progress
        </h3>

        <div className="flex gap-5 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            Completed
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            Pending
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10
          }}
        >
          <CartesianGrid stroke="#ececec" vertical={false} />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />

          <Line
            type="monotone"
            dataKey="pending"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default function Dashboard() {
  const { user } = useContext(AuthContext)

const [dashboard, setDashboard] = useState({
  totalClients: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  chartData: [],
  recentActivity: []
});

  const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      };

      const response = await axios.get(
        "http://localhost:5000/api/dashboard",
        config
      );
      setDashboard(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    fetchDashboard();
  }
}, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-lg font-medium">
        Loading Dashboard...
      </div>
    )
  }

  return (
    <>
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={dashboard.totalClients}
          trend="Live"
          trendUp
        />

        <StatCard
          icon={CheckSquare}
          label="Total Tasks"
          value={dashboard.totalTasks}
          trend="Live"
          trendUp
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={dashboard.completedTasks}
          trend="Completed"
          trendUp
        />

        <StatCard
          icon={Clock}
          label="Pending Tasks"
          value={dashboard.pendingTasks}
          trend="Pending"
          trendUp={false}
        />
      </div>

      {/* Chart + Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
        <TasksChart data={dashboard.chartData} />
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>

        {(dashboard.recentActivity || []).length === 0 ? (
          <p className="text-sm text-slate-500">
            No recent activity found.
          </p>
        ) : (
          <ul className="space-y-4">
            {(dashboard.recentActivity || []).map((activity) => (
              <li
                key={activity.id}
                className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>

                <div>
                  <p className="font-medium text-slate-800">
                    {activity.text}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Status : {activity.status}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
     </div>
    </>
  )
}