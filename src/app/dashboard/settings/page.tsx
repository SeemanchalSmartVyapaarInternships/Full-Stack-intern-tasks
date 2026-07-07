import type { Metadata } from 'next';
import { Settings, Bell, Moon, Shield, Database, ChevronRight, User, CreditCard, Globe } from 'lucide-react';

export const metadata: Metadata = { title: 'Settings — SSC' };

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card">
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Toggle({ id, label, description, defaultChecked = false }: { id: string; label: string; description?: string; defaultChecked?: boolean }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 cursor-pointer group py-1">
      <div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="relative flex-shrink-0">
        <input id={id} type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-red-600 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:bg-white" />
      </div>
    </label>
  );
}

function NavRow({ icon: Icon, label, value }: { icon: React.ComponentType<{size?:number;className?:string}>; label: string; value?: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {value && <p className="text-xs text-gray-400">{value}</p>}
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={22} className="text-red-600" /> Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and configuration.</p>
      </div>

      <div className="space-y-5">
        <Section title="Account" description="Personal profile and contact information.">
          <NavRow icon={User}       label="Edit Profile"    value="Vikash Kumar · vikash.kumar@ssc.io" />
          <NavRow icon={CreditCard} label="Billing & Plans" value="Enterprise Plan — renews Jul 1" />
          <NavRow icon={Globe}      label="Language"        value="English (US)" />
        </Section>

        <Section title="Notifications" description="Control when and how you receive alerts.">
          <Toggle id="notif-email"   label="Email Notifications"   description="Receive updates via email"               defaultChecked />
          <Toggle id="notif-push"    label="Push Notifications"    description="Browser and mobile push alerts"          defaultChecked />
          <Toggle id="notif-billing" label="Billing Alerts"        description="Payment and subscription reminders"      defaultChecked />
          <Toggle id="notif-team"    label="Team Activity"         description="When a team member joins or is updated"             />
          <Toggle id="notif-weekly"  label="Weekly Digest"         description="Summary report every Monday"                        />
        </Section>

        <Section title="Appearance" description="Customize how the dashboard looks.">
          <Toggle id="theme-dark"    label="Dark Mode"             description="Switch to a darker UI theme"                        />
          <Toggle id="compact-mode"  label="Compact View"          description="Reduce spacing between elements"                    />
          <Toggle id="animations"    label="Animations"            description="Smooth transitions and micro-animations" defaultChecked />
        </Section>

        <Section title="Security" description="Protect your account and data.">
          <Toggle id="2fa"           label="Two-Factor Authentication" description="Require a code when signing in" defaultChecked />
          <Toggle id="session-log"   label="Session Logging"           description="Track all login events"                       />
          <NavRow icon={Shield}      label="Active Sessions"        value="2 devices" />
          <NavRow icon={Database}    label="Export Data"            value="Download all your data as CSV" />
        </Section>

        <div className="flex flex-col sm:flex-row gap-3">
          <button id="save-settings-btn"  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
            Save Changes
          </button>
          <button id="reset-settings-btn" className="flex-1 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-sm font-medium border border-gray-200 transition-colors">
            Reset to Defaults
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h3>
          <p className="text-xs text-red-600 mb-3">Once you delete your account, there is no going back. Please be certain.</p>
          <button id="delete-account-btn" className="px-4 py-2 rounded-xl bg-white border border-red-300 text-red-700 text-sm font-medium hover:bg-red-600 hover:text-white transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
