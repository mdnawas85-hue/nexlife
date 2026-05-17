import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../types';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import TaskModal from '../components/common/TaskModal';
import { formatDate, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';

export default function MyTasks() {
  const { tasks, projects, currentUser, updateTask } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const myTasks = tasks
    .filter((t) => t.assigneeId === currentUser.id)
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter);

  const grouped = {
    todo: myTasks.filter((t) => t.status === 'todo'),
    in_progress: myTasks.filter((t) => t.status === 'in_progress'),
    in_review: myTasks.filter((t) => t.status === 'in_review'),
    done: myTasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">{myTasks.filter((t) => t.status !== 'done').length} open tasks</p>
        </div>
        <div className="flex items-center gap-2">
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
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {myTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tasks assigned"
          description="You don't have any tasks assigned to you yet."
        />
      ) : (
        <div className="space-y-6">
          {(['todo', 'in_progress', 'in_review', 'done'] as const).map((status) => {
            const statusTasks = grouped[status];
            if (statusTasks.length === 0) return null;

            return (
              <div key={status}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  {getStatusLabel(status)}
                  <span className="bg-gray-100 text-gray-600 rounded-full text-xs px-2 py-0.5">
                    {statusTasks.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {statusTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="flex items-center gap-4 bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTask(task.id, { status: e.target.checked ? 'done' : 'todo' });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-indigo-500 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                          </p>
                          {project && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="text-xs text-gray-500">{project.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge className={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                          {task.dueDate && (
                            <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={selectedTask.projectId}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
