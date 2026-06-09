import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import SalesOverviewChart from "@/components/dashboard/SalesOverviewChart";
import CategoryDistribution from "@/components/dashboard/CategoryDistribution";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { statsData, recentActivityData } from "@/lib/data";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Dashboard Overview 👋
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Welcome back, Admin! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                color: "var(--text-body)",
              }}
            >
              <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">May 20 – May 26, 2026</span>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--blue)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        <section aria-labelledby="stats-heading">
          <h3 id="stats-heading" className="sr-only">Key Performance Indicators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <StatsCard key={stat.id} {...stat} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <SalesOverviewChart />
          </div>
          <div className="lg:col-span-3">
            <CategoryDistribution />
          </div>
          <div className="lg:col-span-4">
            <RecentActivityFeed />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <ActivityTable activities={recentActivityData} />
          </div>
          <div className="lg:col-span-4">
            <QuickActions />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
