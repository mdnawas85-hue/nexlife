import { useState } from 'react';
import { Bell, Moon, Globe, Shield, Save, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { loadEmailSettings, saveEmailSettings } from '../lib/emailNotifications';

interface SettingsState {
  emailNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
  twoFactor: boolean;
  sessionTimeout: string;
}

function loadDefaults(): SettingsState {
  const saved = loadEmailSettings();
  return {
    emailNotifications: saved.emailNotifications,
    taskReminders: saved.taskReminders,
    projectUpdates: saved.projectUpdates,
    weeklyDigest: false,
    darkMode: false,
    language: 'en',
    timezone: 'Asia/Kolkata',
    twoFactor: false,
    sessionTimeout: '30',
  };
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-indigo-500">{icon}</span>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(loadDefaults);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof SettingsState, value: boolean | string) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveEmailSettings({
      emailNotifications: settings.emailNotifications,
      taskReminders: settings.taskReminders,
      projectUpdates: settings.projectUpdates,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <Section title="Notifications" icon={<Bell size={16} />}>
        <SettingRow label="Email Notifications" description="Receive updates via email">
          <Toggle checked={settings.emailNotifications} onChange={(v) => set('emailNotifications', v)} />
        </SettingRow>
        <SettingRow label="Task Reminders" description="Get reminded before task due dates">
          <Toggle checked={settings.taskReminders} onChange={(v) => set('taskReminders', v)} />
        </SettingRow>
        <SettingRow label="Project Updates" description="Notify when a project status changes">
          <Toggle checked={settings.projectUpdates} onChange={(v) => set('projectUpdates', v)} />
        </SettingRow>
        <SettingRow label="Weekly Digest" description="Summary email every Monday morning">
          <Toggle checked={settings.weeklyDigest} onChange={(v) => set('weeklyDigest', v)} />
        </SettingRow>
      </Section>

      <Section title="Appearance & Region" icon={<Moon size={16} />}>
        <SettingRow label="Dark Mode" description="Switch to dark theme">
          <Toggle checked={settings.darkMode} onChange={(v) => set('darkMode', v)} />
        </SettingRow>
        <SettingRow label="Language">
          <select
            value={settings.language}
            onChange={(e) => set('language', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </SettingRow>
        <SettingRow label="Timezone">
          <select
            value={settings.timezone}
            onChange={(e) => set('timezone', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Europe/Paris">Europe/Paris (CET)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </SettingRow>
      </Section>

      <Section title="Security" icon={<Shield size={16} />}>
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
          <Toggle checked={settings.twoFactor} onChange={(v) => set('twoFactor', v)} />
        </SettingRow>
        <SettingRow label="Session Timeout" description="Auto sign-out after inactivity">
          <select
            value={settings.sessionTimeout}
            onChange={(e) => set('sessionTimeout', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="240">4 hours</option>
            <option value="0">Never</option>
          </select>
        </SettingRow>
      </Section>

      <Section title="Integrations" icon={<Globe size={16} />}>
        <div className="space-y-3">
          {[
            { name: 'GitHub', desc: 'Link pull requests to tasks', connected: true },
            { name: 'Slack', desc: 'Send task notifications to Slack', connected: false },
            { name: 'Google Drive', desc: 'Attach Drive files to tasks', connected: false },
            { name: 'Jira', desc: 'Sync issues with Jira', connected: false },
          ].map((int) => (
            <div key={int.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800">{int.name}</p>
                <p className="text-xs text-gray-400">{int.desc}</p>
              </div>
              <button
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  int.connected
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {int.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save size={15} />
          Save Settings
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={16} />
            Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}
