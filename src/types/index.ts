export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  joinedAt: string;
  lastActive: string;
  projects: number;
  tasks: number;
}

export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'violet' | 'emerald' | 'amber' | 'rose' | 'sky';
  prefix?: string;
  suffix?: string;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  action: string;
  target: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  amount?: string;
  timestamp: string;
  type: 'transaction' | 'user' | 'system' | 'content';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  timestamp: string;
  avatar?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  children?: NavItem[];
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export type UserRole = 'admin' | 'editor' | 'viewer';
export type Theme = 'dark' | 'light';
