'use client';

import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'ghost';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600 border border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50  text-amber-700  border border-amber-200',
  error:   'bg-red-50    text-red-700    border border-red-200',
  info:    'bg-sky-50    text-sky-700    border border-sky-200',
  primary: 'bg-red-50    text-red-700    border border-red-200',
  ghost:   'bg-transparent text-gray-500 border border-gray-200',
};

const dotColorMap: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
  info:    'bg-sky-500',
  primary: 'bg-red-600',
  ghost:   'bg-gray-400',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({ children, variant = 'default', size = 'sm', dot = false, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 font-medium rounded-full', variantMap[variant], sizeMap[size], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColorMap[variant])} />}
      {children}
    </span>
  );
}
