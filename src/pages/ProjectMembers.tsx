import { Mail, Shield, CheckCircle2, FolderKanban } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Project } from '../types';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';

interface Props {
  project: Project;
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-purple-100 text-purple-700',
  developer: 'bg-blue-100 text-blue-700',
  designer: 'bg-pink-100 text-pink-700',
  tester: 'bg-yellow-100 text-yellow-700',
};

export default function ProjectMembers({ project }: Props) {
  const { users, tasks, projects } = useAppStore();
  const members = users.filter((u) => project.memberIds.includes(u.id));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Team Members ({members.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const assignedTasks = tasks.filter(
            (t) => t.assigneeId === member.id && t.projectId === project.id
          );
          const completedTasks = assignedTasks.filter((t) => t.status === 'done').length;
          const activeProjects = projects.filter((p) => p.memberIds.includes(member.id)).length;

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <Avatar name={member.name} color={member.avatarColor} size="lg" initials={member.avatar} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  <Badge className={`mt-1 ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>
                    <Shield size={10} className="mr-1" />
                    {member.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <Mail size={13} className="text-gray-400" />
                <span className="truncate text-xs">{member.email}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
                    <CheckCircle2 size={14} />
                    <span className="font-bold">{assignedTasks.length}</span>
                  </div>
                  <p className="text-xs text-gray-400">Assigned</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-0.5">
                    <FolderKanban size={14} />
                    <span className="font-bold">{activeProjects}</span>
                  </div>
                  <p className="text-xs text-gray-400">Projects</p>
                </div>
              </div>

              {assignedTasks.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Task completion</span>
                    <span>{completedTasks}/{assignedTasks.length}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(completedTasks / assignedTasks.length) * 100}%`,
                        backgroundColor: member.avatarColor,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
