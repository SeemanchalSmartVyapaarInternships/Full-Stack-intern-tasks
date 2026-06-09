"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  DashboardIcon,
  AnalyticsIcon,
  UsersIcon,
  InventoryIcon,
  OrdersIcon,
  BillingIcon,
  ReportsIcon,
  SettingsIcon,
  CloseIcon,
} from "@/components/ui/Icons";
import { navLinks } from "@/lib/data";

const iconMap = {
  dashboard: DashboardIcon,
  analytics: AnalyticsIcon,
  users: UsersIcon,
  inventory: InventoryIcon,
  orders: OrdersIcon,
  billing: BillingIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
};

export default function Sidebar({ isOpen, onClose, collapsed, mobileOnly }) {
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const navItemsRef = useRef(null);

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
        {
          x: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.3,
          ease: "power2.out",
          delay: 0.2,
          clearProps: "transform",
        }
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
      <div
        className="flex items-center justify-between px-4 h-16 shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: "var(--topbar-bg)", border: "1px solid var(--border-color)" }}
          >
            <img src="/logo.png" alt="SmartVyapar Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">SmartVyapar</p>
              <p className="text-[11px] whitespace-nowrap" style={{ color: "var(--sidebar-muted)" }}>
                Admin Dashboard
              </p>
            </div>
          )}
        </div>
        {mobileOnly && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--sidebar-text)" }}
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav ref={navItemsRef} className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p
            className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "var(--sidebar-muted)" }}
          >
            Main Menu
          </p>
        )}
        <ul className="space-y-0.5">
          {navLinks.map((link) => {
            const Icon = iconMap[link.icon];
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
                  {Icon && (
                    <Icon
                      className="w-5 h-5 shrink-0"
                      style={{ color: isActive ? "#ffffff" : "var(--sidebar-icon)" }}
                    />
                  )}
                  {!collapsed && link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );

  if (mobileOnly) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 sidebar-transition lg:hidden
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {inner}
        </div>
      </>
    );
  }

  return inner;
}
