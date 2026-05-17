import { useState } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Project } from '../types';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
];

interface Props {
  project: Project;
}

export default function ProjectSettings({ project }: Props) {
  const { users, updateProject, deleteProject } = useAppStore();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    color: project.color,
    startDate: project.startDate,
    endDate: project.endDate,
    memberIds: [...project.memberIds],
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(project.id, form);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    navigate('/projects');
  };

  const toggleMember = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-offset-1 ring-indigo-400' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <label
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.memberIds.includes(user.id)
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} color={user.avatarColor} size="sm" initials={user.avatar} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role} · {user.email}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.memberIds.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Save size={15} />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100 mt-6">
        <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Deleting a project will permanently remove all tasks, milestones, and data associated with it.
        </p>
        {!showDeleteConfirm ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={15} />
            Delete Project
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-red-600">Are you sure?</p>
            <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}
