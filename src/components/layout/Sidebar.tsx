import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/team', icon: Users, label: 'Team' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, projects } = useAppStore();
  const location = useLocation();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0"
      style={{
        width: sidebarCollapsed ? '64px' : '220px',
        backgroundColor: '#1e2235',
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-4 py-4 border-b border-white/10 h-16">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="ml-2.5 font-bold text-white text-base truncate">ProManage</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-0.5 px-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                title={sidebarCollapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150 group
                  ${isActive
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Recent Projects */}
        {!sidebarCollapsed && (
          <div className="mt-6 px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Projects
            </p>
            <div className="space-y-0.5">
              {projects.slice(0, 4).map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors
                    ${isActive ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
