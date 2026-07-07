'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, Users, ShoppingCart, Package,
  FileText, Settings, ChevronLeft, ChevronRight, Zap, ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from '@/contexts/SidebarContext';
import { navItems, currentUser } from '@/data/mock';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import type { NavItem } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, BarChart3, Users, ShoppingCart, Package, FileText, Settings,
};

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[item.icon];
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;

  if (item.requiredRole && item.requiredRole !== currentUser.role && currentUser.role !== 'admin') return null;

  return (
    <li>
      <Link
        href={hasChildren ? '#' : item.href}
        id={`nav-${item.id}`}
        onClick={hasChildren ? (e) => { e.preventDefault(); setExpanded(!expanded); } : undefined}
        className={clsx(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium',
          isActive
            ? 'bg-red-50 text-red-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          collapsed && 'justify-center px-2'
        )}
      >
        {/* Active left bar */}
        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-red-600 rounded-r-full" />}

        {Icon && (
          <Icon
            size={18}
            className={clsx('flex-shrink-0 transition-colors', isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600')}
          />
        )}

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && <Badge variant="primary" size="sm">{item.badge}</Badge>}
            {hasChildren && <ChevronDown size={14} className={clsx('transition-transform duration-200', expanded && 'rotate-180')} />}
          </>
        )}

        {/* Tooltip when collapsed */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg pointer-events-none">
            {item.label}
            {item.badge && <span className="ml-1.5 text-red-300">({item.badge})</span>}
          </div>
        )}
      </Link>

      {hasChildren && !collapsed && expanded && (
        <ul className="mt-1 ml-6 space-y-0.5 border-l border-gray-200 pl-3">
          {item.children!.map((child) => <NavLink key={child.id} item={child} collapsed={false} />)}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      id="desktop-sidebar"
      className={clsx(
        'hidden md:flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 relative',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center h-16 border-b border-gray-200 flex-shrink-0', isCollapsed ? 'justify-center px-2' : 'px-5 gap-3')}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-sm flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <span className="text-gray-900 font-bold text-base tracking-tight">S</span>
            <span className="text-red-600 font-bold text-base tracking-tight">S</span>
            <span className="text-gray-900 font-bold text-base tracking-tight">C</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-thin">
        {!isCollapsed && (
          <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Main Menu</p>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => <NavLink key={item.id} item={item} collapsed={isCollapsed} />)}
        </ul>
      </nav>

      {/* User section */}
      <div className={clsx('border-t border-gray-200 p-3 flex-shrink-0', isCollapsed && 'flex justify-center')}>
        {isCollapsed ? (
          <Avatar initials={currentUser.avatar} size="sm" online />
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
            <Avatar initials={currentUser.avatar} size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
            <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        id="sidebar-collapse-btn"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm z-10"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
