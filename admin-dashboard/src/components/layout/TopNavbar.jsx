"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, SearchIcon, MenuIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { notificationsData } from "@/lib/data";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import UserProfile from "@/components/dashboard/UserProfile";

export default function TopNavbar({ onMenuToggle, onCollapseToggle, collapsed }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notificationsData.filter((n) => !n.read).length;

  const displayUser = {
    name: user?.name || "Admin User",
    role: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Super Admin",
    avatar: "/favicon.ico",
    email: user?.email || "",
    department: "Management",
  };

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 shrink-0 glass"
      style={{
        backgroundColor: "var(--topbar-bg)",
        borderBottom: "1px solid var(--topbar-border)",
        boxShadow: "var(--topbar-shadow)",
      }}
    >
      <div className="flex items-center gap-2 flex-1">
        {/* Hamburger: mobile = drawer, desktop = collapse toggle */}
        <button
          id="mobile-menu-toggle"
          onClick={() => {
            if (window.innerWidth >= 1024) {
              onCollapseToggle?.();
            } else {
              onMenuToggle();
            }
          }}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center flex-1 max-w-xs">
          <div className="relative w-full">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              id="global-search"
              type="search"
              placeholder="Search anything..."
              className="w-full pl-9 pr-16 py-2 text-sm rounded-lg transition-all duration-150"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--input-text)",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--input-border)")}
              aria-label="Global search"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded font-mono hidden sm:block"
              style={{
                color: "var(--text-muted)",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
          style={{ color: "var(--text-secondary)" }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notification-toggle"
            onClick={() => {
              setShowNotifications((p) => !p);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label={`Notifications (${unreadCount} unread)`}
            aria-expanded={showNotifications}
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: "#ef4444" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 z-50">
              <NotificationPanel
                notifications={notificationsData}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
        </div>

        <div className="w-px h-6 mx-1" style={{ backgroundColor: "var(--border-color)" }} />

        {/* User profile */}
        <div className="relative" ref={userRef}>
          <button
            id="user-profile-toggle"
            onClick={() => {
              setShowUserMenu((p) => !p);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-primary)" }}
            aria-label="User profile menu"
            aria-expanded={showUserMenu}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)" }}
            >
              <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                {displayUser.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {displayUser.role}
              </p>
            </div>
            <ChevronDownIcon
              className={`hidden sm:block w-4 h-4 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
              style={{ color: "var(--text-muted)" }}
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 z-50">
              <UserProfile user={displayUser} onClose={() => setShowUserMenu(false)} onLogout={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
