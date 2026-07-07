'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu, Search, Bell, ChevronDown, LogOut, User, CreditCard,
  HelpCircle, Settings, Shield,
} from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from '@/contexts/SidebarContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import { currentUser, notifications } from '@/data/mock';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/users': 'Users',
  '/dashboard/orders': 'Orders',
  '/dashboard/products': 'Products',
  '/dashboard/content': 'Content',
  '/dashboard/settings': 'Settings',
};

const roleColors = {
  admin:  'text-red-700 bg-red-50 border-red-200',
  editor: 'text-sky-700 bg-sky-50 border-sky-200',
  viewer: 'text-gray-600 bg-gray-100 border-gray-200',
};

export default function Navbar() {
  const { toggleOpen } = useSidebar();
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle   = breadcrumbMap[pathname] || 'Dashboard';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="top-navbar"
      className="h-16 flex items-center gap-4 px-4 md:px-6 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30"
    >
      {/* Mobile hamburger */}
      <button
        id="mobile-menu-btn"
        onClick={toggleOpen}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0 flex-1 md:flex-initial">
        <span className="text-gray-400 hidden md:inline">Dashboard</span>
        {pathname !== '/dashboard' && (
          <>
            <span className="text-gray-300 hidden md:inline">/</span>
            <span className="text-gray-800 font-medium truncate">{pageTitle}</span>
          </>
        )}
        {pathname === '/dashboard' && <span className="text-gray-800 font-medium md:hidden">{pageTitle}</span>}
      </div>

      <div className="flex-1" />

      {/* Search bar */}
      <div className={clsx(
        'hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200',
        searchFocused
          ? 'w-72 bg-white border-red-400 shadow-sm ring-2 ring-red-100'
          : 'w-48 bg-gray-50 border-gray-200 hover:border-gray-300'
      )}>
        <Search size={14} className={clsx('flex-shrink-0 transition-colors', searchFocused ? 'text-red-600' : 'text-gray-400')} />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search anything..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className={clsx('hidden lg:flex text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 font-mono transition-opacity', searchFocused && 'opacity-0')}>⌘K</kbd>
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          id="notification-bell-btn"
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label={`Notifications — ${unreadCount} unread`}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />}
        </button>

        {notifOpen && (
          <div id="notification-dropdown" className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-card-hover z-50 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs text-red-600 hover:text-red-800 cursor-pointer font-medium">Mark all read</span>}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className={clsx('flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100/70 last:border-0', !notif.read && 'bg-red-50/40')}>
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold',
                    notif.type === 'success' && 'bg-emerald-50 text-emerald-600',
                    notif.type === 'warning' && 'bg-amber-50 text-amber-600',
                    notif.type === 'error'   && 'bg-red-50 text-red-600',
                    notif.type === 'info'    && 'bg-sky-50 text-sky-600',
                  )}>
                    {notif.type === 'success' ? '✓' : notif.type === 'warning' ? '⚠' : notif.type === 'error' ? '✕' : 'ℹ'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                  {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0 mt-1" />}
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100">
              <button className="w-full text-xs text-center text-gray-500 hover:text-gray-700 transition-colors">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      <ThemeToggle />

      {/* Profile dropdown */}
      <div ref={profileRef} className="relative">
        <button
          id="profile-dropdown-btn"
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="User profile menu"
          aria-expanded={profileOpen}
        >
          <Avatar initials={currentUser.avatar} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-800 leading-none">{currentUser.name.split(' ')[0]}</p>
            <p className={clsx('text-xs mt-0.5 border rounded px-1 capitalize font-medium', roleColors[currentUser.role])}>{currentUser.role}</p>
          </div>
          <ChevronDown size={14} className={clsx('text-gray-400 transition-transform duration-200', profileOpen && 'rotate-180')} />
        </button>

        {profileOpen && (
          <div id="profile-dropdown-menu" className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-2xl shadow-card-hover z-50 overflow-hidden animate-scale-in">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar initials={currentUser.avatar} size="md" online />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield size={10} className="text-red-600" />
                    <span className="text-xs text-red-600 font-medium capitalize">{currentUser.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-1.5">
              {[
                { icon: User,        label: 'Your Profile',   id: 'menu-profile'  },
                { icon: CreditCard,  label: 'Billing',        id: 'menu-billing'  },
                { icon: Settings,    label: 'Settings',       id: 'menu-settings' },
                { icon: HelpCircle,  label: 'Help & Support', id: 'menu-help'     },
              ].map(({ icon: Icon, label, id }) => (
                <button key={id} id={id} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors text-left">
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 p-1.5">
              <button id="menu-logout" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors text-left">
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
