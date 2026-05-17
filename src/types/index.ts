export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'tester';
  avatarColor: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold' | 'planning';
  color: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId: string | null;
  dueDate: string | null;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  estimatedHours: number;
  loggedHours: number;
  milestoneId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  taskIds: string[];
}

export interface ActivityItem {
  id: string;
  userId: string;
  action: string;
  target: string;
  projectId?: string;
  taskId?: string;
  createdAt: string;
}
