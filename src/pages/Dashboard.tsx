import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { formatDate, formatRelative, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';

export default function Dashboard() {
  const { projects, tasks, users, activities, currentUser, getProjectProgress } = useAppStore();

  const totalProjects = projects.length;
  const activeTasks = tasks.filter((t) => t.status !== 'done').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalMembers = users.length;

  const myTasks = tasks
    .filter((t) => t.assigneeId === currentUser.id && t.status !== 'done')
    .slice(0, 5);

  const recentProjects = projects
    .filter((p) => p.status === 'active')
    .slice(0, 4);

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: FolderKanban,
      color: 'bg-indigo-50 text-indigo-600',
      change: '+2 this month',
    },
    {
      label: 'Active Tasks',
      value: activeTasks,
      icon: Clock,
      color: 'bg-blue-50 text-blue-600',
      change: `${completedTasks} completed`,
    },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      change: `${Math.round((completedTasks / (completedTasks + activeTasks)) * 100)}% completion rate`,
    },
    {
      label: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      change: 'Across all projects',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening across your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Projects</h2>
            <Link
              to="/projects"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProjects.map((project) => {
              const progress = getProjectProgress(project.id);
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const members = users.filter((u) => project.memberIds.includes(u.id));

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
                        {project.name}
                      </p>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <ProgressBar value={progress} color={project.color} size="sm" />
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400">{progress}% complete</span>
                      <span className="text-xs text-gray-400">{projectTasks.length} tasks</span>
                      <span className="text-xs text-gray-400">Due {formatDate(project.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2 flex-shrink-0">
                    {members.slice(0, 3).map((member) => (
                      <Avatar key={member.id} name={member.name} color={member.avatarColor} size="xs" initials={member.avatar} />
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Tasks</h2>
              <Link to="/my-tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {myTasks.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No tasks assigned</p>
                </div>
              ) : (
                myTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  return (
                    <div key={task.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: project?.color || '#6366f1' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-gray-400">
                                Due {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {activities.slice(0, 5).map((activity) => {
                const user = users.find((u) => u.id === activity.userId);
                return (
                  <div key={activity.id} className="flex items-start gap-3 px-5 py-3.5">
                    {user && (
                      <Avatar name={user.name} color={user.avatarColor} size="xs" initials={user.avatar} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{user?.name}</span>{' '}
                        {activity.action}{' '}
                        <span className="text-indigo-600 font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelative(activity.createdAt)}
                      </p>
                    </div>
                    <AlertCircle size={12} className="text-gray-300 mt-1 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
