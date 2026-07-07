import type { Metadata } from 'next';
import StatsCards from '@/components/dashboard/StatsCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ActivityTable from '@/components/dashboard/ActivityTable';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import { currentUser } from '@/data/mock';

export const metadata: Metadata = {
  title: 'Overview — SSC Dashboard',
  description: 'Monitor key metrics, revenue, team activity and notifications.',
};

function GreetingHeader() {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const emoji    = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl" aria-hidden="true">{emoji}</span>
        <h1 className="text-xl font-bold text-gray-900">
          {greeting}, <span className="text-red-600">{currentUser.name.split(' ')[0]}</span>
        </h1>
      </div>
      <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your business today.</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <GreetingHeader />

      <section aria-label="Key metrics" className="mb-6">
        <StatsCards />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <section aria-label="Revenue chart"><RevenueChart /></section>
          <section aria-label="Recent activity"><ActivityTable /></section>
        </div>
        <div className="space-y-5">
          <section aria-label="Notifications"><NotificationPanel /></section>
          <section aria-label="User profile"><UserProfileCard /></section>
        </div>
      </div>
    </div>
  );
}
