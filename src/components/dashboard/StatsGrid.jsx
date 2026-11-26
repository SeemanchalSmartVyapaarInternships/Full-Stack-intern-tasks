'use client';

import { Activity, Clock, Users, Wallet } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import StatCard from '@/components/ui/StatCard';

const KPI_ICONS = {
  revenue: Wallet,
  users: Users,
  approvals: Clock,
  uptime: Activity,
};

const KPI_ACCENTS = {
  revenue: 'indigo',
  users: 'emerald',
  approvals: 'amber',
  uptime: 'blue',
};

export default function StatsGrid() {
  const { activeTenant } = useTenant();

  return (
    <section aria-label="Key Performance Statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {activeTenant.kpis.map((kpi) => (
        <StatCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          delta={kpi.delta}
          trend={kpi.trend}
          comparison={kpi.comparison}
          icon={KPI_ICONS[kpi.id] || Activity}
          accent={KPI_ACCENTS[kpi.id] || 'indigo'}
        />
      ))}
    </section>
  );
}
