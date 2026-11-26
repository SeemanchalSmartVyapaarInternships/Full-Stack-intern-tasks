import OverviewHeader from '@/components/dashboard/OverviewHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RevenueChart from '@/components/dashboard/RevenueChart';
import UsageBreakdown from '@/components/dashboard/UsageBreakdown';
import RecentActivityTable from '@/components/dashboard/RecentActivityTable';

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <StatsGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RevenueChart />
        </div>
        <div className="lg:col-span-4">
          <UsageBreakdown />
        </div>
      </div>

      <RecentActivityTable pageSize={5} />
    </div>
  );
}
