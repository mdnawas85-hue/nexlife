import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';

export default function Reports() {
  const { tasks, projects, getProjectProgress } = useAppStore();

  // Tasks by status
  const statusData = [
    { name: 'To Do', value: tasks.filter((t) => t.status === 'todo').length, color: '#9ca3af' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'In Review', value: tasks.filter((t) => t.status === 'in_review').length, color: '#f59e0b' },
    { name: 'Done', value: tasks.filter((t) => t.status === 'done').length, color: '#10b981' },
  ];

  // Tasks by priority
  const priorityData = [
    { name: 'Low', value: tasks.filter((t) => t.priority === 'low').length, color: '#10b981' },
    { name: 'Medium', value: tasks.filter((t) => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: tasks.filter((t) => t.priority === 'high').length, color: '#f97316' },
    { name: 'Critical', value: tasks.filter((t) => t.priority === 'critical').length, color: '#ef4444' },
  ];

  // Tasks completed over time (mock weekly data)
  const weeklyData = [
    { week: 'Mar W1', completed: 2, created: 5 },
    { week: 'Mar W2', completed: 4, created: 3 },
    { week: 'Mar W3', completed: 3, created: 4 },
    { week: 'Mar W4', completed: 5, created: 6 },
    { week: 'Apr W1', completed: 6, created: 4 },
    { week: 'Apr W2', completed: 4, created: 5 },
    { week: 'Apr W3', completed: 7, created: 3 },
    { week: 'Apr W4', completed: 5, created: 4 },
    { week: 'May W1', completed: 8, created: 6 },
    { week: 'May W2', completed: 6, created: 5 },
    { week: 'May W3', completed: 4, created: 7 },
  ];

  // Project progress
  const projectProgressData = projects.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    progress: getProjectProgress(p.id),
    color: p.color,
  }));

  const totalHours = tasks.reduce((sum, t) => sum + t.loggedHours, 0);
  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Project performance and team insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: tasks.length, sub: `${completionRate}% completion rate`, color: 'text-indigo-600' },
          { label: 'Completed', value: tasks.filter((t) => t.status === 'done').length, sub: 'Tasks finished', color: 'text-green-600' },
          { label: 'Hours Logged', value: `${totalHours}h`, sub: `of ${totalEstimated}h estimated`, color: 'text-blue-600' },
          { label: 'Overdue', value: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length, sub: 'Need attention', color: 'text-red-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks by Status Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Legend
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Priority Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Legend
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks Over Time Line Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Task Activity Over Time</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            />
            <Legend
              formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="created"
              name="Created"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#6366f1' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Project Progress Bar Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Project Progress</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={projectProgressData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Progress']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            />
            <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
              {projectProgressData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
