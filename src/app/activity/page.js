'use client';

import OverviewHeader from '@/components/dashboard/OverviewHeader';
import RecentActivityTable from '@/components/dashboard/RecentActivityTable';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <RecentActivityTable pageSize={10} title="Complete Audit & Activity Stream" />
    </div>
  );
}
