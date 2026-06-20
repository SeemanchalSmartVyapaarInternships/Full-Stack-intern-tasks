"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { TrendingUp, Users, ShoppingCart, IndianRupee, ArrowUpRight } from "lucide-react";

const kpis = [
  { label: "Monthly Revenue",  value: "₹1,24,560", change: "+24.8%", Icon: IndianRupee,  color: "var(--blue)" },
  { label: "New Users",        value: "1,247",      change: "+18.6%", Icon: Users,        color: "var(--green-text)" },
  { label: "Orders Processed", value: "8,942",      change: "+12.4%", Icon: ShoppingCart, color: "#7c3aed" },
  { label: "Avg Order Value",  value: "₹13,934",    change: "+6.2%",  Icon: TrendingUp,   color: "var(--yellow-text)" },
];

const monthData = [
  { month: "Jan", revenue: 68000,  orders: 420 },
  { month: "Feb", revenue: 82000,  orders: 510 },
  { month: "Mar", revenue: 74000,  orders: 466 },
  { month: "Apr", revenue: 98000,  orders: 622 },
  { month: "May", revenue: 112000, orders: 714 },
  { month: "Jun", revenue: 124560, orders: 892 },
];

const topProducts = [
  { name: "iPhone 15 Pro",      revenue: "₹38,999", units: 42,  share: 31 },
  { name: "MacBook Air M3",     revenue: "₹26,999", units: 28,  share: 22 },
  { name: "Smart Watch Pro",    revenue: "₹18,499", units: 67,  share: 15 },
  { name: "Wireless Earbuds",   revenue: "₹12,499", units: 124, share: 10 },
  { name: "Gaming Keyboard",    revenue: "₹8,999",  units: 89,  share: 7 },
];

const maxRevenue = Math.max(...monthData.map(d => d.revenue));

export default function AnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Business performance overview — June 2026</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl p-5"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <k.Icon size={18} style={{ color: k.color }} />
                <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "var(--green-text)" }}>
                  <ArrowUpRight size={12} />{k.change}
                </span>
              </div>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="lg:col-span-2 rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>Revenue Trend (6 months)</h3>
            <svg viewBox="0 0 460 160" className="w-full">
              {monthData.map((d, i) => {
                const h = Math.round((d.revenue / maxRevenue) * 120);
                const x = 20 + i * 72;
                return (
                  <g key={d.month}>
                    <rect x={x} y={150 - h} width={44} height={h} rx={6}
                      fill={i === monthData.length - 1 ? "var(--blue)" : "var(--blue-muted)"} />
                    <text x={x + 22} y={158} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.month}</text>
                    <text x={x + 22} y={147 - h} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">
                      {Math.round(d.revenue / 1000)}k
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Top products */}
          <div className="rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Top Products</h3>
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate max-w-[140px]" style={{ color: "var(--text-body)" }}>{p.name}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{p.revenue}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                    <div className="h-full rounded-full" style={{ width: `${p.share}%`, backgroundColor: "var(--blue)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
