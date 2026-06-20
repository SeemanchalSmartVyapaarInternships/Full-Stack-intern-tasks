"use client";

import { LogoutIcon, SettingsIcon } from "@/components/ui/Icons";

export default function UserProfile({ user, onClose, onLogout }) {
  return (
    <div
      id="user-profile-panel"
      className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      }}
      role="dialog"
      aria-label="User profile menu"
    >
      <div
        className="px-4 py-4"
        style={{
          background: "linear-gradient(135deg, var(--blue-bg), var(--blue-muted))",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {user.email}
            </p>
            <span
              className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: "var(--blue-muted)", color: "var(--blue-text)" }}
            >
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--divider)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Department</span>
          <span className="text-xs font-semibold" style={{ color: "var(--text-body)" }}>{user.department}</span>
        </div>
      </div>

      <div className="p-2">
        <button
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "var(--text-body)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--input-bg)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          onClick={onClose}
          aria-label="Account settings"
        >
          <SettingsIcon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          Account Settings
        </button>
        <button
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "var(--red-text)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--red-bg)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          onClick={() => { onClose(); onLogout?.(); }}
          aria-label="Sign out"
        >
          <LogoutIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
