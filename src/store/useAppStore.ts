import { create } from 'zustand';
import type { User, Project, Task, Milestone, ActivityItem } from '../types';
import { mockUsers, mockProjects, mockTasks, mockMilestones, mockActivities } from './mockData';

interface AppState {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  activities: ActivityItem[];
  sidebarCollapsed: boolean;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;

  // Milestone actions
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Milestone;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  // UI actions
  toggleSidebar: () => void;

  // Helpers
  getProjectTasks: (projectId: string) => Task[];
  getProjectProgress: (projectId: string) => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  projects: mockProjects,
  tasks: mockTasks,
  milestones: mockMilestones,
  activities: mockActivities,
  sidebarCollapsed: false,

  addProject: (projectData) => {
    const now = new Date().toISOString();
    const project: Project = {
      ...projectData,
      id: `p${generateId()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.projectId !== id),
    }));
  },

  addTask: (taskData) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: `t${generateId()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  moveTask: (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  addMilestone: (milestoneData) => {
    const milestone: Milestone = {
      ...milestoneData,
      id: `m${generateId()}`,
    };
    set((state) => ({ milestones: [...state.milestones, milestone] }));
    return milestone;
  },

  updateMilestone: (id, updates) => {
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  },

  deleteMilestone: (id) => {
    set((state) => ({
      milestones: state.milestones.filter((m) => m.id !== id),
    }));
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  getProjectTasks: (projectId) => {
    return get().tasks.filter((t) => t.projectId === projectId);
  },

  getProjectProgress: (projectId) => {
    const tasks = get().tasks.filter((t) => t.projectId === projectId);
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  },
}));
