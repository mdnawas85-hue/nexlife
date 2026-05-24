import { Mail, FolderKanban, Shield } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  developer: 'bg-blue-100 text-blue-700',
  designer: 'bg-pink-100 text-pink-700',
  tester: 'bg-yellow-100 text-yellow-700',
};

export default function TeamPage() {
  const { users, tasks, projects } = useAppStore();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} members across {projects.length} projects</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Members</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-900">{tasks.filter((t) => t.status !== 'done').length}</p>
          <p className="text-sm text-gray-500 mt-1">Open Tasks</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-900">{projects.filter((p) => p.status === 'active').length}</p>
          <p className="text-sm text-gray-500 mt-1">Active Projects</p>
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((member) => {
          const assignedTasks = tasks.filter((t) => t.assigneeId === member.id);
          const completedTasks = assignedTasks.filter((t) => t.status === 'done').length;
          const activeTasks = assignedTasks.filter((t) => t.status !== 'done').length;
          const activeProjects = projects.filter((p) => p.memberIds.includes(member.id));
          const completionRate = assignedTasks.length > 0
            ? Math.round((completedTasks / assignedTasks.length) * 100)
            : 0;

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card top colored band */}
              <div className="h-1" style={{ backgroundColor: member.avatarColor }} />

              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={member.name} color={member.avatarColor} size="lg" initials={member.avatar} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base truncate">{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge className={roleColors[member.role] || 'bg-gray-100 text-gray-600'}>
                        <Shield size={10} className="mr-1" />
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                      <Mail size={11} />
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-lg font-bold text-gray-800">{assignedTasks.length}</p>
                    <p className="text-xs text-gray-400">Assigned</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg py-2">
                    <p className="text-lg font-bold text-blue-700">{activeTasks}</p>
                    <p className="text-xs text-blue-500">Active</p>
                  </div>
                  <div className="bg-green-50 rounded-lg py-2">
                    <p className="text-lg font-bold text-green-700">{completedTasks}</p>
                    <p className="text-xs text-green-500">Done</p>
                  </div>
                </div>

                {assignedTasks.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Completion rate</span>
                      <span className="font-medium text-gray-600">{completionRate}%</span>
                    </div>
                    <ProgressBar value={completionRate} color={member.avatarColor} size="sm" />
                  </div>
                )}

                {/* Active projects */}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    <FolderKanban size={11} />
                    {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeProjects.slice(0, 3).map((project) => (
                      <span
                        key={project.id}
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.split(' ')[0]}
                      </span>
                    ))}
                    {activeProjects.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        +{activeProjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
