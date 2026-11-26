'use client';

import Link from 'next/link';
import { ArrowUpRight, Database, HardDrive, Lock, PlugZap, Users } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { computeUsagePercent, formatCompactNumber } from '@/lib/formatters';
import Card from '@/components/ui/Card';

export default function UsageBreakdown() {
  const { activeTenant, can } = useTenant();
  const { usage } = activeTenant;
  const canViewBilling = can('viewBilling');

  const quotas = [
    {
      label: 'Licensed Team Seats',
      icon: Users,
      usedLabel: `${usage.seatsUsed} / ${usage.seatsLimit} seats`,
      percent: computeUsagePercent(usage.seatsUsed, usage.seatsLimit),
    },
    {
      label: 'Cloud Attachment Storage',
      icon: HardDrive,
      usedLabel: `${usage.storageUsedGb} GB / ${usage.storageLimitGb} GB`,
      percent: computeUsagePercent(usage.storageUsedGb, usage.storageLimitGb),
    },
    {
      label: 'Monthly API Requests',
      icon: Database,
      usedLabel: `${formatCompactNumber(usage.apiCallsUsed)} / ${formatCompactNumber(usage.apiCallsLimit)}`,
      percent: computeUsagePercent(usage.apiCallsUsed, usage.apiCallsLimit),
    },
  ];

  const barTone = (pct) => {
    if (pct >= 85) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-indigo-600';
  };

  return (
    <Card
      title="Tenant Capacity & Quotas"
      subtitle={`${activeTenant.plan} subscription limits`}
      action={
        canViewBilling ? (
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Manage Plan
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400" title="Admin role required">
            <Lock className="h-3 w-3" />
            Billing Restricted
          </span>
        )
      }
    >
      <div className="space-y-4">
        {quotas.map((quota) => {
          const Icon = quota.icon;
          return (
            <div key={quota.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  {quota.label}
                </span>
                <span className="font-semibold text-slate-900">{quota.usedLabel}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barTone(quota.percent)}`}
                  style={{ width: `${quota.percent}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[11px] text-slate-500">{quota.percent}% utilized</p>
            </div>
          );
        })}

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs">
          <span className="flex items-center gap-2 font-medium text-slate-700">
            <PlugZap className="h-4 w-4 text-emerald-600" />
            Active Integrations
          </span>
          <span className="font-semibold text-slate-900">{usage.integrationsActive} connected</span>
        </div>
      </div>
    </Card>
  );
}
