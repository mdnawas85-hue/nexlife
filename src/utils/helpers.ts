import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No date';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateShort = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM d');
  } catch {
    return '-';
  }
};

export const formatRelative = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

export const isOverdue = (dateString: string | null): boolean => {
  if (!dateString) return false;
  try {
    return isAfter(new Date(), parseISO(dateString));
  } catch {
    return false;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'todo': return 'bg-gray-100 text-gray-700';
    case 'in_progress': return 'bg-blue-100 text-blue-700';
    case 'in_review': return 'bg-yellow-100 text-yellow-700';
    case 'done': return 'bg-green-100 text-green-700';
    case 'active': return 'bg-green-100 text-green-700';
    case 'completed': return 'bg-blue-100 text-blue-700';
    case 'on_hold': return 'bg-orange-100 text-orange-700';
    case 'planning': return 'bg-purple-100 text-purple-700';
    case 'pending': return 'bg-gray-100 text-gray-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'todo': return 'To Do';
    case 'in_progress': return 'In Progress';
    case 'in_review': return 'In Review';
    case 'done': return 'Done';
    case 'active': return 'Active';
    case 'completed': return 'Completed';
    case 'on_hold': return 'On Hold';
    case 'planning': return 'Planning';
    case 'pending': return 'Pending';
    case 'overdue': return 'Overdue';
    default: return status;
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-700';
    case 'medium': return 'bg-yellow-100 text-yellow-700';
    case 'high': return 'bg-orange-100 text-orange-700';
    case 'critical': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export const getPriorityDot = (priority: string): string => {
  switch (priority) {
    case 'low': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'high': return 'bg-orange-500';
    case 'critical': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};
