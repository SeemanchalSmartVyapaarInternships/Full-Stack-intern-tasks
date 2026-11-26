'use client';

import { Download, Globe, Lock } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { buildActivityCsv } from '@/lib/formatters';
import Badge from '@/components/ui/Badge';

const TIMEFRAMES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
];

export default function OverviewHeader() {
  const { activeTenant, timeframe, setTimeframe, roleMeta, can } = useTenant();
  const canExport = can('exportAudit');

  const handleExportCsv = () => {
    if (!canExport) return;
    const csv = buildActivityCsv(activeTenant.activities);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTenant.slug}-activity-log.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {activeTenant.name}
          </h1>
          <Badge tone={activeTenant.status === 'Healthy' ? 'emerald' : 'amber'}>
            {activeTenant.status}
          </Badge>
          <Badge tone={roleMeta.badgeTone}>Viewing as {roleMeta.label}</Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            {activeTenant.domain}
          </span>
          <span>Region: {activeTenant.region}</span>
          <span>Plan: {activeTenant.plan}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          {TIMEFRAMES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeframe(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                timeframe === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!canExport}
          onClick={handleExportCsv}
          title={canExport ? 'Download tenant audit log as CSV' : 'Manager role or higher required to export'}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
            canExport
              ? 'border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50'
              : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
          }`}
        >
          {canExport ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          Export CSV
        </button>
      </div>
    </div>
  );
}
