'use client';

import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { revenueData } from '@/data/mock';

type Metric = 'revenue' | 'expenses' | 'profit';

const metrics: { key: Metric; label: string; stroke: string; fill: string }[] = [
  { key: 'revenue',  label: 'Revenue',  stroke: '#dc2626', fill: 'rgba(220,38,38,0.08)'  },
  { key: 'expenses', label: 'Expenses', stroke: '#f59e0b', fill: 'rgba(245,158,11,0.08)' },
  { key: 'profit',   label: 'Profit',   stroke: '#10b981', fill: 'rgba(16,185,129,0.08)' },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-card-hover">
      <p className="text-xs text-gray-500 font-medium mb-2">{label} 2026</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray-500 capitalize">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold text-gray-800">${(entry.value / 1000).toFixed(0)}K</span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueChart() {
  const [activeMetrics, setActiveMetrics] = useState<Set<Metric>>(new Set(['revenue', 'profit']));

  const toggleMetric = (key: Metric) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); } else next.add(key);
      return next;
    });
  };

  return (
    <div id="revenue-chart-card" className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Revenue Overview</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 ml-10">Jan – Jun 2026 · Monthly breakdown</p>
        </div>

        <div className="flex gap-2">
          {metrics.map((m) => (
            <button
              key={m.key}
              id={`chart-toggle-${m.key}`}
              onClick={() => toggleMetric(m.key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                activeMetrics.has(m.key)
                  ? 'text-gray-700 border-gray-300 bg-gray-100'
                  : 'text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
              )}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeMetrics.has(m.key) ? m.stroke : '#d1d5db' }} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              {metrics.map((m) => (
                <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={m.stroke} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={m.stroke} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map((m) =>
              activeMetrics.has(m.key) ? (
                <Area
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.stroke}
                  strokeWidth={2}
                  fill={`url(#grad-${m.key})`}
                  dot={{ fill: m.stroke, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: m.stroke, strokeWidth: 2, stroke: '#ffffff' }}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
