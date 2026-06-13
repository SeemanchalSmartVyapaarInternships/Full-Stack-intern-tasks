'use client';

import React from 'react';
import clsx from 'clsx';

interface AvatarProps {
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'red' | 'sky' | 'emerald' | 'amber' | 'rose' | 'pink' | 'indigo';
  online?: boolean;
  className?: string;
}

const colorMap = {
  red:     'from-red-500 to-red-700',
  sky:     'from-sky-500 to-blue-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber:   'from-amber-500 to-orange-600',
  rose:    'from-rose-500 to-pink-600',
  pink:    'from-pink-500 to-fuchsia-600',
  indigo:  'from-indigo-500 to-red-600',
};

const sizeMap  = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
const dotSize  = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-4 h-4' };

function getColor(initials: string): keyof typeof colorMap {
  const colors = Object.keys(colorMap) as (keyof typeof colorMap)[];
  return colors[initials.charCodeAt(0) % colors.length];
}

export default function Avatar({ initials, size = 'md', color, online, className }: AvatarProps) {
  const c = color ?? getColor(initials);
  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div className={clsx('rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br shadow-sm', sizeMap[size], colorMap[c])}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={clsx('absolute bottom-0 right-0 rounded-full border-2 border-white', dotSize[size], online ? 'bg-emerald-500' : 'bg-gray-300')} />
      )}
    </div>
  );
}
