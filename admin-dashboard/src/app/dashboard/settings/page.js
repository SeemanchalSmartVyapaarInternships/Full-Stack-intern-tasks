"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, ShieldCheck, Save, CheckCircle2, AlertCircle } from "lucide-react";

const API = "http://localhost:8000/api/users";

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    if (name.trim() === user?.name) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.message || "Update failed." });
      } else {
        updateUser(data.data);
        setFeedback({ type: "success", msg: "Profile updated successfully!" });
      }
    } catch {
      setFeedback({ type: "error", msg: "Server unreachable. Make sure auth server is running on port 8000." });
    } finally {
      setSaving(false);
    }
  }

  const roleColor = { admin: "var(--blue-text)", manager: "var(--green-text)", employee: "var(--text-muted)" };
  const roleBg    = { admin: "var(--blue-bg)",   manager: "var(--green-bg)",   employee: "var(--input-bg)" };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Account Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <div className="card-3d rounded-xl p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--divider)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: "var(--blue)" }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
            <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
              style={{ backgroundColor: roleBg[user?.role], color: roleColor[user?.role] }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
            style={{
              backgroundColor: feedback.type === "success" ? "var(--green-bg)" : "var(--red-bg)",
              color: feedback.type === "success" ? "var(--green-text)" : "var(--red-text)",
            }}>
            {feedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {feedback.msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Editable name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-body)" }}>
              Display Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                <User size={15} />
              </span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                suppressHydrationWarning
                placeholder="Your full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue)")}
                onBlur={e => (e.target.style.borderColor = "var(--input-border)")}
              />
            </div>
          </div>

          {/* Read-only email */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-body)" }}>
              Email Address
              <span className="text-[10px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>(cannot be changed)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                <Mail size={15} />
              </span>
              <input type="email" value={user?.email || ""} readOnly suppressHydrationWarning
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)", cursor: "not-allowed", opacity: 0.7 }} />
            </div>
          </div>

          {/* Read-only role */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-body)" }}>
              Role
              <span className="text-[10px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>(assigned by admin)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                <ShieldCheck size={15} />
              </span>
              <input type="text"
                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""} readOnly
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm capitalize"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)", cursor: "not-allowed", opacity: 0.7 }} />
            </div>
          </div>

          <button type="submit"
            disabled={saving || name.trim() === user?.name || name.trim().length < 2}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ backgroundColor: "var(--blue)" }}>
            <Save size={14} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="card-3d rounded-xl p-6" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Security</h2>
        <div className="space-y-1">
          {[
            { label: "Password",         value: "Last changed never",  action: "Change" },
            { label: "Two-Factor Auth",  value: "Not enabled",          action: "Enable" },
            { label: "Active Sessions",  value: "1 active session",    action: "Manage" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid var(--divider)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{row.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{row.value}</p>
              </div>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "var(--blue-bg)", color: "var(--blue-text)" }}>
                {row.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
