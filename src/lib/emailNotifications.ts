export interface EmailAlert {
  type: 'project' | 'task';
  name: string;
  level: 'overdue' | 'today' | '1day' | '3days' | '7days';
  projectName?: string;
}

function levelLabel(level: EmailAlert['level']): string {
  switch (level) {
    case 'overdue': return 'Overdue';
    case 'today':   return 'Due Today';
    case '1day':    return 'Due Tomorrow';
    case '3days':   return 'Due in 3 Days';
    case '7days':   return 'Due in 7 Days';
  }
}

function levelColor(level: EmailAlert['level']): string {
  switch (level) {
    case 'overdue': return '#dc2626';
    case 'today':   return '#d97706';
    case '1day':    return '#ca8a04';
    case '3days':   return '#2563eb';
    case '7days':   return '#7c3aed';
  }
}

export function buildDeadlineEmailHtml(alerts: EmailAlert[], userName: string): string {
  const rows = alerts.map((a) => {
    const color = levelColor(a.level);
    const label = levelLabel(a.level);
    const sub   = a.type === 'task' && a.projectName ? `<br><span style="color:#6b7280;font-size:12px">${a.projectName}</span>` : '';
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6">
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color}20;color:${color};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">${label}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;padding-left:12px">
          <strong style="color:#111827">${a.name}</strong>${sub}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;text-transform:capitalize;padding-left:8px">${a.type}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">Deadline Alerts</h1>
            <p style="margin:6px 0 0;color:#c7d2fe;font-size:14px">Hi ${userName}, you have ${alerts.length} item${alerts.length !== 1 ? 's' : ''} that need your attention.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <th style="text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;padding-bottom:8px">Status</th>
                <th style="text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;padding-bottom:8px;padding-left:12px">Name</th>
                <th style="text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;padding-bottom:8px;padding-left:8px">Type</th>
              </tr>
              ${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 28px;text-align:center">
            <a href="${typeof window !== 'undefined' ? window.location.origin : ''}" style="display:inline-block;padding:10px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Open Dashboard</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;color:#9ca3af;font-size:12px">
            You're receiving this because email notifications are enabled in your settings.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendDeadlineEmail(
  to: string,
  alerts: EmailAlert[],
  userName: string,
): Promise<void> {
  if (!alerts.length) return;

  const subject = alerts.length === 1
    ? `${levelLabel(alerts[0].level)}: "${alerts[0].name}"`
    : `${alerts.length} Deadline Alerts Require Your Attention`;

  const html = buildDeadlineEmailHtml(alerts, userName);

  const text = alerts.map((a) =>
    `[${levelLabel(a.level)}] ${a.type === 'task' ? `Task: ${a.name}` : `Project: ${a.name}`}${a.projectName ? ` (${a.projectName})` : ''}`,
  ).join('\n');

  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html, text }),
  });
}

const EMAIL_SETTINGS_KEY = 'notif_email_settings';

export interface EmailNotifSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
}

export function loadEmailSettings(): EmailNotifSettings {
  try {
    const raw = localStorage.getItem(EMAIL_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as EmailNotifSettings;
  } catch { /* ignore */ }
  return { emailNotifications: true, taskReminders: true, projectUpdates: true };
}

export function saveEmailSettings(s: Partial<EmailNotifSettings>): void {
  const current = loadEmailSettings();
  localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify({ ...current, ...s }));
}
