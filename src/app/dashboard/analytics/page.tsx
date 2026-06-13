'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, ArrowUpRight, Globe, Smartphone, Monitor } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const channelData = [
  { name: 'Organic',  value: 38500, color: '#dc2626' },
  { name: 'Direct',   value: 24100, color: '#0ea5e9' },
  { name: 'Referral', value: 15700, color: '#10b981' },
  { name: 'Social',   value: 11200, color: '#f59e0b' },
  { name: 'Email',    value: 8400,  color: '#8b5cf6' },
];

const deviceData = [
  { label: 'Desktop', icon: Monitor,    pct: 52, color: 'bg-red-500'     },
  { label: 'Mobile',  icon: Smartphone, pct: 38, color: 'bg-sky-500'     },
  { label: 'Tablet',  icon: Globe,      pct: 10, color: 'bg-emerald-500' },
];

const kpiCards = [
  { label: 'Page Views',       value: '1.24M',  change: '+22.1%', positive: true  },
  { label: 'Bounce Rate',      value: '34.2%',  change: '-5.3%',  positive: true  },
  { label: 'Session Duration', value: '4m 18s', change: '+8.7%',  positive: true  },
  { label: 'Return Visitors',  value: '62.4%',  change: '+3.1%',  positive: true  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-red-600" /> Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Detailed performance metrics and traffic breakdown.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover hover:border-red-100 transition-all">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              <ArrowUpRight size={12} /> {kpi.change} vs last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Traffic by channel */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-red-600" /> Traffic by Channel
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#374151', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="value" name="Sessions" radius={[6, 6, 0, 0]}>
                  {channelData.map((entry, index) => <Cell key={index} fill={entry.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={15} className="text-red-600" /> Device Breakdown
          </h2>
          <div className="space-y-4">
            {deviceData.map(({ label, icon: Icon, pct, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Countries</p>
            {[
              { flag: '🇺🇸', country: 'United States', pct: '34.2%' },
              { flag: '🇬🇧', country: 'United Kingdom', pct: '18.7%' },
              { flag: '🇩🇪', country: 'Germany',        pct: '12.4%' },
              { flag: '🇫🇷', country: 'France',         pct: '9.1%'  },
            ].map(({ flag, country, pct }) => (
              <div key={country} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{flag}</span>
                  <span className="text-xs text-gray-600">{country}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
