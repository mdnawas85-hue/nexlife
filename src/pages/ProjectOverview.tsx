import { CheckCircle2, Clock, AlertTriangle, Users, Calendar, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Project } from '../types';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { formatDate, formatRelative, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';

interface Props {
  project: Project;
}

export default function ProjectOverview({ project }: Props) {
  const { tasks, users, milestones, activities, getProjectProgress } = useAppStore();

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const progress = getProjectProgress(project.id);
  const members = users.filter((u) => project.memberIds.includes(u.id));
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectActivities = activities.filter((a) => a.projectId === project.id).slice(0, 6);

  const todoCount = projectTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = projectTasks.filter((t) => t.status === 'in_review').length;
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;
  const overdueTasks = projectTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'To Do', value: todoCount, icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' },
          { label: 'In Progress', value: inProgressCount, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'In Review', value: inReviewCount, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progress */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Project Progress</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall completion</span>
              <span className="text-2xl font-bold text-gray-900">{progress}%</span>
            </div>
            <ProgressBar value={progress} color={project.color} size="md" />
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'To Do', count: todoCount, color: '#9ca3af' },
                { label: 'In Progress', count: inProgressCount, color: '#3b82f6' },
                { label: 'In Review', count: inReviewCount, color: '#f59e0b' },
                { label: 'Done', count: doneCount, color: '#10b981' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-1"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.count}
                  </div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {projectMilestones.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Milestones</h3>
              <div className="space-y-3">
                {projectMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        milestone.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{milestone.title}</p>
                      <p className="text-xs text-gray-500">{milestone.taskIds.length} tasks</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge className={getStatusColor(milestone.status)}>
                        {getStatusLabel(milestone.status)}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(milestone.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {projectActivities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {projectActivities.map((activity) => {
                  const user = users.find((u) => u.id === activity.userId);
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      {user && (
                        <Avatar name={user.name} color={user.avatarColor} size="xs" initials={user.avatar} />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{user?.name}</span>{' '}
                          {activity.action}{' '}
                          <span className="text-indigo-600">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatRelative(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Project details */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Status</p>
                <Badge className={`mt-1 ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Start Date</p>
                <p className="text-sm text-gray-700 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  {formatDate(project.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">End Date</p>
                <p className="text-sm text-gray-700 mt-0.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  {formatDate(project.endDate)}
                </p>
              </div>
              {overdueTasks > 0 && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} />
                  <span className="text-sm font-medium">{overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Team</h3>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Users size={12} />
                {members.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {members.map((member) => {
                const assigned = projectTasks.filter((t) => t.assigneeId === member.id).length;
                return (
                  <div key={member.id} className="flex items-center gap-2.5">
                    <Avatar name={member.name} color={member.avatarColor} size="sm" initials={member.avatar} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {assigned} tasks
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High priority tasks */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">High Priority</h3>
            <div className="space-y-2">
              {projectTasks
                .filter((t) => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'done')
                .slice(0, 4)
                .map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        task.priority === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                    />
                    <p className="text-xs text-gray-700 flex-1 truncate">{task.title}</p>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                ))}
              {projectTasks.filter((t) => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'done').length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No high priority tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
