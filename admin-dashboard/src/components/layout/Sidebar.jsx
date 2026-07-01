"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { CloseIcon } from "@/components/ui/Icons";
import {
  LayoutDashboard, Users, FolderKanban, ListTodo, Users2,
  BarChart2, FileText, Settings, HelpCircle, Building2, History,
} from "lucide-react";

const allNavLinks = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard, href: "/dashboard",          roles: ["admin","manager","employee"] },
  { id: "users",     label: "Users",      icon: Users,           href: "/dashboard/users",     roles: ["admin"] },
  { id: "analytics", label: "Analytics",  icon: BarChart2,       href: "/dashboard/analytics", roles: ["admin"] },
  { id: "team",      label: "Team",       icon: Users2,          href: "/dashboard/team",      roles: ["admin","manager"] },
  { id: "projects",  label: "Projects",   icon: FolderKanban,    href: "/dashboard/projects",  roles: ["admin","manager","employee"] },
  { id: "tasks",     label: "Tasks",      icon: ListTodo,        href: "/dashboard/tasks",     roles: ["admin","manager"] },
  { id: "reports",   label: "Reports",    icon: FileText,        href: "/dashboard/reports",   roles: ["admin","manager"] },
  { id: "activity",  label: "Activity Logs", icon: History,       href: "/dashboard/activity",  roles: ["admin","manager"] },
  { id: "settings",  label: "Settings",   icon: Settings,        href: "/dashboard/settings",  roles: ["admin","manager","employee"] },
  { id: "support",   label: "Support",    icon: HelpCircle,      href: "/dashboard/support",   roles: ["admin","manager","employee"] },
];

export default function Sidebar({ isOpen, onClose, collapsed, mobileOnly }) {
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const { user } = useAuth();
  const role = user?.role || "employee";

  const navLinks = allNavLinks.filter((l) => l.roles.includes(role));

  useEffect(() => {
    if (!mobileOnly) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power2.out", clearProps: "transform" }
      );
      gsap.fromTo(
        ".nav-item-anim",
        { x: -12, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.04, duration: 0.3, ease: "power2.out", delay: 0.2, clearProps: "transform" }
      );
    }
  }, [mobileOnly]);

  const inner = (
    <aside
      ref={sidebarRef}
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--sidebar-bg)" }}
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--blue)" }}>
            <Building2 size={18} color="#fff" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">SmartVyapar</p>
              <p className="text-[11px] whitespace-nowrap capitalize" style={{ color: "var(--sidebar-muted)" }}>
                {role} Portal
              </p>
            </div>
          )}
        </div>
        {mobileOnly && (
          <button onClick={onClose} className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--sidebar-text)" }} aria-label="Close sidebar">
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "var(--sidebar-muted)" }}>
            Main Menu
          </p>
        )}
        <ul className="space-y-0.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.id} className="nav-item-anim">
                <Link
                  href={link.href}
                  onClick={onClose}
                  title={collapsed ? link.label : undefined}
                  className={`nav-link flex items-center gap-3 rounded-lg text-sm font-medium
                    ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`}
                  style={{
                    backgroundColor: isActive ? "var(--blue)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--sidebar-text)",
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                    style={{ color: isActive ? "#ffffff" : "var(--sidebar-icon)" }}
                  />
                  {!collapsed && link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role badge at bottom */}
      {!collapsed && (
        <div className="px-4 py-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0"
              style={{ backgroundColor: "var(--blue)" }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user?.name || "User"}</p>
              <p className="text-[10px] capitalize" style={{ color: "var(--sidebar-muted)" }}>{role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  if (mobileOnly) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose} aria-hidden="true" />
        )}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 sidebar-transition lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {inner}
        </div>
      </>
    );
  }

  return inner;
}
