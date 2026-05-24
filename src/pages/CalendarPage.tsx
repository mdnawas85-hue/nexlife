import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../types';
import TaskModal from '../components/common/TaskModal';
import { getPriorityDot } from '../utils/helpers';

export default function CalendarPage() {
  const { tasks, projects } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => {
      if (!t.dueDate) return false;
      try {
        return isSameDay(parseISO(t.dueDate), day);
      } catch {
        return false;
      }
    });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 w-40 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {weekDays.map((day) => (
            <div key={day} className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={i}
                className={`
                  min-h-[100px] p-2 border-b border-r border-gray-50
                  ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
                  ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}
              >
                <div className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                  ${isToday ? 'bg-indigo-500 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                `}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate flex items-center gap-1 hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${project?.color}20` || '#e0e7ff',
                          color: project?.color || '#6366f1',
                        }}
                      >
                        <div className={`w-1 h-1 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                        <span className="truncate">{task.title}</span>
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <p className="text-xs text-gray-400 pl-1">+{dayTasks.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
