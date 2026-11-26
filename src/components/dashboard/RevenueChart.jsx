'use client';

import { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { formatCompactNumber, formatCurrency } from '@/lib/formatters';
import Card from '@/components/ui/Card';

export default function RevenueChart() {
  const { activeTenant, timeframe } = useTenant();
  const [metric, setMetric] = useState('revenue');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const series = activeTenant.revenueSeries[timeframe] || activeTenant.revenueSeries['7d'];
  const maxVal = Math.max(...series.map((d) => d[metric]), 1);
  const totalVal = series.reduce((sum, d) => sum + d[metric], 0);

  return (
    <Card
      title={metric === 'revenue' ? 'Tenant Revenue Trend' : 'Active Sessions Trend'}
      subtitle={`Aggregated over ${timeframe === '7d' ? 'last 7 days' : timeframe === '30d' ? 'last 30 days' : 'last 90 days'} · Total: ${
        metric === 'revenue' ? formatCurrency(totalVal, activeTenant.currency) : formatCompactNumber(totalVal)
      }`}
      action={
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              metric === 'revenue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            type="button"
            onClick={() => setMetric('sessions')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              metric === 'sessions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sessions
          </button>
        </div>
      }
    >
      <div className="mt-2">
        <div className="flex h-56 items-end gap-2 sm:gap-4">
          {series.map((point, index) => {
            const val = point[metric];
            const heightPct = Math.max(10, Math.round((val / maxVal) * 100));
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={point.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                {/* Value Label on Hover */}
                <div
                  className={`pointer-events-none absolute -top-2 z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm transition-opacity ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {metric === 'revenue' ? formatCurrency(val, activeTenant.currency) : `${val} sessions`}
                </div>

                {/* Bar Container */}
                <div className="flex w-full flex-1 items-end rounded-lg bg-slate-50 px-1 pt-4">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      metric === 'revenue'
                        ? 'bg-indigo-600 group-hover:bg-indigo-500'
                        : 'bg-emerald-500 group-hover:bg-emerald-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                <span className="text-xs font-medium text-slate-500">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
