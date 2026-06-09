"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/ui/Icons";

const typeConfig = {
  alert:   { bg: "var(--red-bg)",    dot: "#ef4444", icon: "🚨" },
  info:    { bg: "var(--blue-bg)",   dot: "#3b82f6", icon: "ℹ️" },
  success: { bg: "var(--green-bg)",  dot: "#22c55e", icon: "✅" },
  warning: { bg: "var(--yellow-bg)", dot: "#eab308", icon: "⚠️" },
};

export default function NotificationPanel({ notifications, onClose }) {
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
  }

  function markRead(id) {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div
      id="notification-panel"
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      }}
      role="dialog"
      aria-label="Notifications panel"
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--divider)" }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full" style={{ backgroundColor: "var(--blue)" }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium px-2 py-1 rounded transition-colors"
              style={{ color: "var(--blue)" }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close notifications"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ul className="max-h-80 overflow-y-auto" role="list">
        {items.map((n, idx) => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          return (
            <li
              key={n.id}
              className="px-4 py-3 cursor-pointer transition-colors duration-150"
              style={{
                borderBottom: idx < items.length - 1 ? "1px solid var(--divider)" : "none",
                backgroundColor: !n.read ? "var(--notif-unread-bg)" : "transparent",
              }}
              onClick={() => markRead(n.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && markRead(n.id)}
            >
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                  style={{ backgroundColor: cfg.bg }}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: cfg.dot }} />
                    )}
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {n.message}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{n.time}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid var(--divider)" }}>
        <button className="text-xs font-semibold transition-colors" style={{ color: "var(--blue)" }}>
          View all notifications →
        </button>
      </div>
    </div>
  );
}
