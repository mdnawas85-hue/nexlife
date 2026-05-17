import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MessageSquare, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Task } from '../../types';
import Avatar from './Avatar';
import Badge from './Badge';
import Button from './Button';
import { formatDate, getStatusColor, getStatusLabel, getPriorityColor } from '../../utils/helpers';

interface TaskModalProps {
  task: Task | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ task, projectId, isOpen, onClose }: TaskModalProps) {
  const { users, projects, updateTask, addTask, deleteTask } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const projectMembers = users.filter((u) => project?.memberIds.includes(u.id));

  const defaultForm = {
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assigneeId: null as string | null,
    dueDate: null as string | null,
    tags: [] as string[],
    estimatedHours: 0,
    loggedHours: 0,
  };

  const [form, setForm] = useState(defaultForm);
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(!task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
        tags: [...task.tags],
        estimatedHours: task.estimatedHours,
        loggedHours: task.loggedHours,
      });
      setIsEditing(false);
    } else {
      setForm(defaultForm);
      setIsEditing(true);
    }
  }, [task, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (task) {
      updateTask(task.id, form);
      setIsEditing(false);
    } else {
      addTask({
        ...form,
        projectId,
        subtasks: [],
        comments: [],
        milestoneId: null,
      });
      onClose();
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !task) return;
    updateTask(task.id, {
      subtasks: [
        ...task.subtasks,
        { id: `st${Date.now()}`, title: newSubtask.trim(), completed: false },
      ],
    });
    setNewSubtask('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!task) return;
    updateTask(task.id, {
      subtasks: task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return;
    const { currentUser } = useAppStore.getState();
    updateTask(task.id, {
      comments: [
        ...task.comments,
        {
          id: `c${Date.now()}`,
          userId: currentUser.id,
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setNewComment('');
  };

  const addTag = () => {
    if (!newTag.trim() || form.tags.includes(newTag.trim())) return;
    setForm({ ...form, tags: [...form.tags, newTag.trim()] });
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const assignee = users.find((u) => u.id === task?.assigneeId || u.id === form.assigneeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          {isEditing ? (
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title..."
              className="flex-1 text-lg font-semibold text-gray-900 border-b-2 border-indigo-400 focus:outline-none bg-transparent mr-4 pb-0.5"
              autoFocus
            />
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 flex-1 mr-4">{task?.title}</h2>
          )}
          <div className="flex items-center gap-2">
            {task && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Edit
              </button>
            )}
            {task && (
              <button
                onClick={() => { deleteTask(task.id); onClose(); }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              {isEditing ? (
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <Badge className={getStatusColor(task?.status || 'todo')}>
                  {getStatusLabel(task?.status || 'todo')}
                </Badge>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
              {isEditing ? (
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              ) : (
                <Badge className={getPriorityColor(task?.priority || 'medium')}>
                  {task?.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Assignee</label>
              {isEditing ? (
                <select
                  value={form.assigneeId || ''}
                  onChange={(e) => setForm({ ...form, assigneeId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              ) : assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar name={assignee.name} color={assignee.avatarColor} size="xs" initials={assignee.avatar} />
                  <span className="text-sm text-gray-700">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unassigned</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={form.dueDate || ''}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              ) : (
                <span className="text-sm text-gray-700">{formatDate(task?.dueDate || null)}</span>
              )}
            </div>
          </div>

          {/* Time tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <Clock size={11} className="inline mr-1" />
                Estimated Hours
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              ) : (
                <span className="text-sm text-gray-700">{task?.estimatedHours}h</span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Logged Hours</label>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  value={form.loggedHours}
                  onChange={(e) => setForm({ ...form, loggedHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              ) : (
                <span className="text-sm text-gray-700">{task?.loggedHours}h</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            {isEditing ? (
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Add a description..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600">{task?.description || 'No description'}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {tag}
                  {isEditing && (
                    <button onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                      <X size={10} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addTag}>
                  <Plus size={13} />
                </Button>
              </div>
            )}
          </div>

          {/* Save/Cancel for editing */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-1">
              {task && (
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button type="button" onClick={handleSave}>
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          )}

          {/* Subtasks (only when viewing existing task) */}
          {task && !isEditing && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
              </label>
              <div className="space-y-1.5 mb-2">
                {task.subtasks.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className={`text-sm ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  placeholder="Add subtask..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddSubtask}>
                  <Plus size={13} />
                </Button>
              </div>
            </div>
          )}

          {/* Comments (only when viewing existing task) */}
          {task && !isEditing && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <MessageSquare size={11} className="inline mr-1" />
                Comments ({task.comments.length})
              </label>
              <div className="space-y-3 mb-3">
                {task.comments.map((comment) => {
                  const commentUser = users.find((u) => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-2.5">
                      {commentUser && (
                        <Avatar name={commentUser.name} color={commentUser.avatarColor} size="xs" initials={commentUser.avatar} />
                      )}
                      <div className="flex-1 bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">{commentUser?.name}</span>
                          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <Button type="button" size="sm" onClick={handleAddComment}>
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
