import { useState } from 'react';
import { Plus, Search, Filter, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Project, Task } from '../types';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import TaskModal from '../components/common/TaskModal';
import { formatDate, getStatusColor, getPriorityColor } from '../utils/helpers';

interface Props {
  project: Project;
}

export default function ProjectTasks({ project }: Props) {
  const { tasks, users, updateTask } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const projectTasks = tasks
    .filter((t) => t.projectId === project.id)
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <Button size="sm" className="ml-auto" onClick={() => setShowNewTaskModal(true)}>
          <Plus size={14} />
          Add Task
        </Button>
      </div>

      {/* Task List */}
      {projectTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tasks found"
          description="Create a new task or adjust your filters."
          action={
            <Button size="sm" onClick={() => setShowNewTaskModal(true)}>
              <Plus size={14} /> Add Task
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projectTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId);
                const subtasksDone = task.subtasks.filter((s) => s.completed).length;
                const subtasksTotal = task.subtasks.length;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTask(task.id, { status: e.target.checked ? 'done' : 'todo' });
                          }}
                          className="w-4 h-4 rounded accent-indigo-500 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                          </p>
                          {task.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {task.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTask(task.id, { status: e.target.value as Task['status'] });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${getStatusColor(task.status)}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={assignee.name} color={assignee.avatarColor} size="xs" initials={assignee.avatar} />
                          <span className="text-sm text-gray-600">{assignee.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {subtasksTotal > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{subtasksDone}/{subtasksTotal}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskModal
        task={selectedTask}
        projectId={project.id}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* New Task Modal */}
      <TaskModal
        task={null}
        projectId={project.id}
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      />
    </div>
  );
}
