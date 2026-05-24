import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { sendDeadlineEmail, loadEmailSettings } from '../lib/emailNotifications';

type AlertLevel = 'overdue' | 'today' | '1day' | '3days' | '7days';

interface DeadlineAlert {
  id: string;
  type: 'project' | 'task';
  name: string;
  level: AlertLevel;
  projectName?: string;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getAlertLevel(days: number): AlertLevel | null {
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return '1day';
  if (days <= 3) return '3days';
  if (days <= 7) return '7days';
  return null;
}

function alertTitle(level: AlertLevel, type: 'project' | 'task'): string {
  const label = type === 'project' ? 'Project' : 'Task';
  switch (level) {
    case 'overdue': return `🚨 ${label} Overdue!`;
    case 'today':   return `⚠️ ${label} Due Today`;
    case '1day':    return `📅 ${label} Due Tomorrow`;
    case '3days':   return `📆 ${label} Due in 3 Days`;
    case '7days':   return `🔔 ${label} Due in 7 Days`;
  }
}

function alertBody(alert: DeadlineAlert): string {
  if (alert.type === 'task' && alert.projectName) {
    return `"${alert.name}" — ${alert.projectName}`;
  }
  return `"${alert.name}"`;
}

// Key used to track which alerts have already been sent today
function storageKey(alertId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `notified_${today}_${alertId}`;
}

function alreadyNotified(alertId: string): boolean {
  return !!localStorage.getItem(storageKey(alertId));
}

function markNotified(alertId: string): void {
  localStorage.setItem(storageKey(alertId), '1');
}

function sendBrowserNotification(alert: DeadlineAlert): void {
  if (Notification.permission !== 'granted') return;
  const key = `${alert.type}_${alert.id}_${alert.level}`;
  if (alreadyNotified(key)) return;
  markNotified(key);
  new Notification(alertTitle(alert.level, alert.type), {
    body: alertBody(alert),
    icon: '/favicon.svg',
    tag: key,
  });
}

export function collectAlerts(
  projects: ReturnType<typeof useAppStore.getState>['projects'],
  tasks: ReturnType<typeof useAppStore.getState>['tasks'],
): DeadlineAlert[] {
  const alerts: DeadlineAlert[] = [];

  projects.forEach((p) => {
    if (p.status === 'completed') return;
    const days = daysUntil(p.endDate);
    const level = getAlertLevel(days);
    if (level) alerts.push({ id: p.id, type: 'project', name: p.name, level });
  });

  tasks.forEach((t) => {
    if (!t.dueDate || t.status === 'done') return;
    const days = daysUntil(t.dueDate);
    const level = getAlertLevel(days);
    if (level) {
      const proj = projects.find((p) => p.id === t.projectId);
      alerts.push({ id: t.id, type: 'task', name: t.title, level, projectName: proj?.name });
    }
  });

  return alerts;
}

const EMAIL_SENT_KEY = (alertId: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return `email_notified_${today}_${alertId}`;
};

function alreadyEmailedToday(alertId: string): boolean {
  return !!localStorage.getItem(EMAIL_SENT_KEY(alertId));
}

function markEmailedToday(alertId: string): void {
  localStorage.setItem(EMAIL_SENT_KEY(alertId), '1');
}

export function useDeadlineNotifications() {
  const { projects, tasks, currentUser } = useAppStore();

  useEffect(() => {
    const check = () => {
      const alerts = collectAlerts(projects, tasks);
      alerts.forEach(sendBrowserNotification);

      const emailSettings = loadEmailSettings();
      if (!emailSettings.emailNotifications || !currentUser?.email) return;

      const unsent = alerts.filter((a) => {
        const key = `${a.type}_${a.id}_${a.level}`;
        return !alreadyEmailedToday(key);
      });

      if (unsent.length === 0) return;

      const emailAlerts = unsent
        .filter((a) => {
          if (a.type === 'task' && !emailSettings.taskReminders) return false;
          if (a.type === 'project' && !emailSettings.projectUpdates) return false;
          return true;
        })
        .map((a) => ({
          type: a.type,
          name: a.name,
          level: a.level,
          projectName: a.projectName,
        }));

      if (emailAlerts.length === 0) return;

      sendDeadlineEmail(currentUser.email, emailAlerts, currentUser.name).then(() => {
        unsent.forEach((a) => markEmailedToday(`${a.type}_${a.id}_${a.level}`));
      }).catch(() => { /* silent — browser notifications already fired */ });
    };

    check();
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projects, tasks, currentUser]);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}
