import { useState } from 'react';
import { Plus, Target, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Project, Milestone } from '../types';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';

interface Props {
  project: Project;
}

export default function ProjectMilestones({ project }: Props) {
  const { milestones, tasks, addMilestone, updateMilestone, deleteMilestone } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'pending' as Milestone['status'],
  });

  const projectMilestones = milestones.filter((m) => m.projectId === project.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addMilestone({
      ...form,
      projectId: project.id,
      taskIds: [],
    });
    setForm({ title: '', description: '', dueDate: '', status: 'pending' });
    setShowModal(false);
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'in_progress': return <Clock size={16} className="text-blue-500" />;
      case 'overdue': return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Target size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Milestones ({projectMilestones.length})</h2>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} />
          Add Milestone
        </Button>
      </div>

      {projectMilestones.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No milestones yet"
          description="Create milestones to track major project checkpoints."
          action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Milestone</Button>}
        />
      ) : (
        <div className="space-y-4">
          {/* Timeline */}
          <div className="relative">
            {projectMilestones.map((milestone, index) => {
              const milestoneTasks = tasks.filter((t) => milestone.taskIds.includes(t.id));
              const completedTasks = milestoneTasks.filter((t) => t.status === 'done').length;
              const progress = milestoneTasks.length > 0
                ? Math.round((completedTasks / milestoneTasks.length) * 100)
                : 0;
              const isLast = index === projectMilestones.length - 1;

              return (
                <div key={milestone.id} className="flex gap-4 group">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      milestone.status === 'completed' ? 'bg-green-100' :
                      milestone.status === 'in_progress' ? 'bg-blue-100' :
                      milestone.status === 'overdue' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(milestone.status)}
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-1" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-white rounded-xl p-4 shadow-sm border mb-4 ${
                    milestone.status === 'completed' ? 'border-green-100' :
                    milestone.status === 'overdue' ? 'border-red-100' :
                    'border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <Badge className={getStatusColor(milestone.status)}>
                          {getStatusLabel(milestone.status)}
                        </Badge>
                        <select
                          value={milestone.status}
                          onChange={(e) => updateMilestone(milestone.id, { status: e.target.value as Milestone['status'] })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <button
                          onClick={() => deleteMilestone(milestone.id)}
                          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        Due {formatDate(milestone.dueDate)}
                      </span>
                      <span>{milestone.taskIds.length} tasks linked</span>
                    </div>

                    {milestoneTasks.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Task completion</span>
                          <span>{completedTasks}/{milestoneTasks.length}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Milestone">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Beta Release"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Milestone['status'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Add Milestone</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
