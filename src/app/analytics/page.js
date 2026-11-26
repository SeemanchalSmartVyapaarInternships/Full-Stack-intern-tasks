'use client';

import { Activity, Cpu, Globe, Server } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import OverviewHeader from '@/components/dashboard/OverviewHeader';
import RevenueChart from '@/components/dashboard/RevenueChart';
import UsageBreakdown from '@/components/dashboard/UsageBreakdown';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';

export default function AnalyticsPage() {
  const { activeTenant } = useTenant();
  const { usage } = activeTenant;

  const endpoints = [
    { route: '/api/v1/tenants/summary', p95: '68 ms', rpm: '1,420', status: 'Healthy' },
    { route: '/api/v1/auth/verify-jwt', p95: '41 ms', rpm: '3,890', status: 'Healthy' },
    { route: '/api/v1/audit/events', p95: '112 ms', rpm: '740', status: 'Healthy' },
    {
      route: '/api/v1/webhooks/dispatch',
      p95: activeTenant.status === 'Healthy' ? '138 ms' : '295 ms',
      rpm: '310',
      status: activeTenant.status === 'Healthy' ? 'Healthy' : 'Degraded',
    },
  ];

  return (
    <div className="space-y-6">
      <OverviewHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="API Utilization"
          value={`${Math.round((usage.apiCallsUsed / usage.apiCallsLimit) * 100)}%`}
          delta="+4.1%"
          trend="up"
          comparison="of monthly quota"
          icon={Cpu}
          accent="indigo"
        />
        <StatCard
          label="Active Integrations"
          value={String(usage.integrationsActive)}
          delta="+2"
          trend="up"
          comparison="Connected webhooks & SSO"
          icon={Globe}
          accent="emerald"
        />
        <StatCard
          label="Avg P95 Latency"
          value={activeTenant.status === 'Healthy' ? '94 ms' : '148 ms'}
          delta="-11 ms"
          trend="up"
          comparison={activeTenant.region}
          icon={Server}
          accent="blue"
        />
        <StatCard
          label="Error Budget Remaining"
          value="99.4%"
          delta="+0.2%"
          trend="up"
          comparison="30-day rolling window"
          icon={Activity}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RevenueChart />
        </div>
        <div className="lg:col-span-5">
          <UsageBreakdown />
        </div>
      </div>

      <Card title="Endpoint Telemetry" subtitle={`Live service latency for ${activeTenant.name}`} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Endpoint</th>
                <th className="px-4 py-3">P95 Latency</th>
                <th className="px-4 py-3">Throughput (RPM)</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpoints.map((ep) => (
                <tr key={ep.route} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-mono font-medium text-slate-900">{ep.route}</td>
                  <td className="px-4 py-3.5 text-slate-600">{ep.p95}</td>
                  <td className="px-4 py-3.5 text-slate-600">{ep.rpm} req/min</td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge tone={ep.status === 'Healthy' ? 'emerald' : 'amber'}>{ep.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
