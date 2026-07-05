'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, Users, ShoppingCart, Package,
  FileText, Settings, Zap, X,
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

function MobileNavLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const pathname = usePathname();
  const Icon = iconMap[item.icon];
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  if (item.requiredRole && item.requiredRole !== currentUser.role && currentUser.role !== 'admin') return null;

  return (
    <li>
      <Link
        href={item.href}
        id={`mobile-nav-${item.id}`}
        onClick={onClose}
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
          isActive ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        )}
      >
        {Icon && <Icon size={18} className={clsx(isActive ? 'text-red-600' : 'text-gray-400')} />}
        <span>{item.label}</span>
        {item.badge && <Badge variant="primary" size="sm" className="ml-auto">{item.badge}</Badge>}
      </Link>
    </li>
  );
}

export default function MobileSidebar() {
  const { isOpen, closeOnMobile } = useSidebar();

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeOnMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        id="mobile-sidebar"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-gray-900 font-bold text-base">
              S<span className="text-red-600">S</span>C
            </span>
          </div>
          <button
            id="mobile-sidebar-close-btn"
            onClick={closeOnMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => <MobileNavLink key={item.id} item={item} onClose={closeOnMobile} />)}
          </ul>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar initials={currentUser.avatar} size="md" online />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.role} · {currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
