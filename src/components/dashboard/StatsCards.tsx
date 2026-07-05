'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DollarSign, Users, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import { statCards } from '@/data/mock';
import type { StatCard } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  DollarSign, Users, ShoppingCart, TrendingUp,
};

const colorConfig = {
  violet: {
    bg: 'bg-gradient-to-br from-red-600 to-red-700',
    card: 'bg-red-50 border-red-100',
    icon: 'bg-red-600 text-white',
    value: 'text-gray-900',
    badge: 'bg-white text-red-700 border border-red-200',
    bar: 'bg-red-500',
    glow: 'shadow-glow-red',
  },
  sky: {
    bg: 'bg-gradient-to-br from-sky-500 to-sky-700',
    card: 'bg-sky-50 border-sky-100',
    icon: 'bg-sky-600 text-white',
    value: 'text-gray-900',
    badge: 'bg-white text-sky-700 border border-sky-200',
    bar: 'bg-sky-500',
    glow: '',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    card: 'bg-amber-50 border-amber-100',
    icon: 'bg-amber-500 text-white',
    value: 'text-gray-900',
    badge: 'bg-white text-amber-700 border border-amber-200',
    bar: 'bg-amber-500',
    glow: '',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    card: 'bg-emerald-50 border-emerald-100',
    icon: 'bg-emerald-600 text-white',
    value: 'text-gray-900',
    badge: 'bg-white text-emerald-700 border border-emerald-200',
    bar: 'bg-emerald-500',
    glow: 'shadow-glow-emerald',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    card: 'bg-rose-50 border-rose-100',
    icon: 'bg-rose-600 text-white',
    value: 'text-gray-900',
    badge: 'bg-white text-rose-700 border border-rose-200',
    bar: 'bg-rose-500',
    glow: '',
  },
};

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);
  return count;
}

function StatCardItem({ card }: { card: StatCard }) {
  const Icon = iconMap[card.icon];
  const colors = colorConfig[card.color];
  const isPositive = card.change >= 0;
  const numericValue = parseFloat(card.value.replace(/,/g, ''));
  const animatedNum  = useCountUp(numericValue);
  const formattedValue = animatedNum.toLocaleString('en-US', {
    minimumFractionDigits: card.suffix === '%' ? 2 : 0,
    maximumFractionDigits: card.suffix === '%' ? 2 : 0,
  });

  return (
    <div
      id={`stat-card-${card.id}`}
      className={clsx('relative rounded-2xl border p-5 hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300 cursor-default animate-fade-in overflow-hidden', colors.card)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colors.icon)}>
          {Icon && <Icon size={20} />}
        </div>
        <span className={clsx('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full', colors.badge)}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(card.change)}%
        </span>
      </div>

      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{card.title}</p>
      <p className={clsx('text-2xl font-bold tracking-tight', colors.value)}>
        {card.prefix}{formattedValue}{card.suffix}
      </p>
      <p className="text-xs text-gray-400 mt-1">{card.changeLabel}</p>

      {/* Sparkline */}
      <div className="mt-4 h-8 flex items-end gap-0.5 opacity-30">
        {[40, 55, 45, 70, 60, 80, 65, 90, 75, 100].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className={clsx('flex-1 rounded-sm', colors.bar)} />
        ))}
      </div>
    </div>
  );
}

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statCards.map((card) => <StatCardItem key={card.id} card={card} />)}
    </div>
  );
}
