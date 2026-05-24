import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Milestone,
  Users,
  Paperclip,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import Badge from '../components/common/Badge';
import { getStatusColor, getStatusLabel } from '../utils/helpers';
import ProjectOverview from './ProjectOverview';
import ProjectTasks from './ProjectTasks';
import ProjectKanban from './ProjectKanban';
import ProjectMilestones from './ProjectMilestones';
import ProjectMembers from './ProjectMembers';
import ProjectFiles from './ProjectFiles';
import ProjectSettings from './ProjectSettings';

type Tab = 'overview' | 'tasks' | 'kanban' | 'milestones' | 'members' | 'files' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'milestones', label: 'Milestones', icon: Milestone },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const project = projects.find((p) => p.id === id);
  if (!project) return <Navigate to="/projects" replace />;

  const projectTasks = tasks.filter((t) => t.projectId === id);

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 px-6 pt-4 pb-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link to="/projects" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={14} />
            Projects
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{project.name}</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: project.color }}
          >
            {project.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            {projectTasks.length} tasks
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 overflow-x-auto">
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${activeTab === tabId
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && <ProjectOverview project={project} />}
        {activeTab === 'tasks' && <ProjectTasks project={project} />}
        {activeTab === 'kanban' && <ProjectKanban project={project} />}
        {activeTab === 'milestones' && <ProjectMilestones project={project} />}
        {activeTab === 'members' && <ProjectMembers project={project} />}
        {activeTab === 'files' && <ProjectFiles project={project} />}
        {activeTab === 'settings' && <ProjectSettings project={project} />}
      </div>
    </div>
  );
}
