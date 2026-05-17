import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Project, Task } from '../types';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import TaskModal from '../components/common/TaskModal';
import { formatDateShort, getPriorityColor, getPriorityDot } from '../utils/helpers';

interface Props {
  project: Project;
}

type KanbanColumn = {
  id: Task['status'];
  label: string;
  color: string;
  bg: string;
};

const columns: KanbanColumn[] = [
  { id: 'todo', label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-100' },
  { id: 'in_progress', label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'in_review', label: 'In Review', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { id: 'done', label: 'Done', color: 'text-green-600', bg: 'bg-green-100' },
];

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { users } = useAppStore();
  const assignee = users.find((u) => u.id === task.assigneeId);
  const subtasksDone = task.subtasks.filter((s) => s.completed).length;
  const subtasksTotal = task.subtasks.length;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3.5 shadow-sm border cursor-pointer transition-all group
        ${isDragging ? 'shadow-xl border-indigo-300 rotate-1 scale-105' : 'border-gray-100 hover:shadow-md hover:border-indigo-200'}
      `}
    >
      {/* Priority dot + tags */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
        <Badge className={`${getPriorityColor(task.priority)} text-xs py-0`}>{task.priority}</Badge>
        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-sm font-medium text-gray-800 mb-2 leading-snug">{task.title}</p>

      {subtasksTotal > 0 && (
        <div className="mb-2">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{subtasksDone}/{subtasksTotal} subtasks</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-gray-400">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : ''}`}>
              {isOverdue && <AlertTriangle size={11} />}
              <Clock size={11} />
              {formatDateShort(task.dueDate)}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare size={11} />
              {task.comments.length}
            </span>
          )}
        </div>
        {assignee && (
          <Avatar name={assignee.name} color={assignee.avatarColor} size="xs" initials={assignee.avatar} />
        )}
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

export default function ProjectKanban({ project }: Props) {
  const { tasks, moveTask } = useAppStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const getColumnTasks = (status: Task['status']) =>
    projectTasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      moveTask(taskId, targetColumn.id);
      return;
    }

    // Check if dropped on another task - find which column that task is in
    const targetTask = projectTasks.find((t) => t.id === overId);
    if (targetTask && targetTask.status !== activeTask?.status) {
      moveTask(taskId, targetTask.status);
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{projectTasks.length} tasks</p>
        <Button
          size="sm"
          onClick={() => {
            setShowNewTaskModal(true);
          }}
        >
          <Plus size={14} />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4 h-full min-h-0">
          {columns.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div key={column.id} className="flex flex-col min-h-0">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-3 ${column.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/60 ${column.color}`}>
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewTaskModal(true);
                    }}
                    className={`p-1 rounded hover:bg-white/50 transition-colors ${column.color}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Drop Zone */}
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id={column.id}
                    className="flex-1 space-y-2.5 overflow-y-auto min-h-24 p-1 rounded-xl transition-colors"
                    style={{ minHeight: '100px' }}
                  >
                    {columnTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl h-20 flex items-center justify-center text-sm text-gray-400">
                        Drop here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} onClick={() => {}} isDragging />
          )}
        </DragOverlay>
      </DndContext>

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
