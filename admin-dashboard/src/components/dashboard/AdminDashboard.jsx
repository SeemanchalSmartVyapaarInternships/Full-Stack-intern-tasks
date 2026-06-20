"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { Users, TrendingUp, ShoppingCart, AlertCircle, BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  { id: "users",   label: "Total Users",   value: "12,456", change: "+18.6%", up: true,  Icon: Users,        bg: "var(--icon-blue)",   color: "var(--blue-text)" },
  { id: "revenue", label: "Total Revenue", value: "₹1,24,560", change: "+24.8%", up: true, Icon: TrendingUp, bg: "var(--icon-green)",  color: "var(--green-text)" },
  { id: "orders",  label: "Total Orders",  value: "8,942",  change: "+12.4%", up: true,  Icon: ShoppingCart, bg: "var(--icon-purple)", color: "#7c3aed" },
  { id: "pending", label: "Pending Issues",value: "147",    change: "-3.2%",  up: false, Icon: AlertCircle,  bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
];

const recentUsers = [
  { name: "Rahul Sharma",  email: "rahul@sv.com",  role: "manager",  joined: "Jun 19" },
  { name: "Priya Singh",   email: "priya@sv.com",  role: "employee", joined: "Jun 18" },
  { name: "Amit Verma",   email: "amit@sv.com",   role: "employee", joined: "Jun 17" },
  { name: "Neha Gupta",   email: "neha@sv.com",   role: "manager",  joined: "Jun 16" },
  { name: "Kiran Patel",  email: "kiran@sv.com",  role: "employee", joined: "Jun 15" },
];

const roleColor = { admin: "var(--blue-text)", manager: "var(--green-text)", employee: "var(--text-muted)" };
const roleBg   = { admin: "var(--blue-bg)",   manager: "var(--green-bg)",   employee: "var(--input-bg)" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(cardsRef.current.filter(Boolean),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "back.out(1.4)", clearProps: "transform" }
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Welcome back, {user?.name}. Full system overview.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "var(--blue-bg)", color: "var(--blue-text)" }}>
          Admin Access
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => (cardsRef.current[i] = el)}
            className="card-3d rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.Icon size={18} style={{ color: s.color }} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold`}
                style={{ color: s.up ? "var(--green-text)" : "var(--red-text)" }}>
                {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue Overview</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Monthly performance</p>
            </div>
            <BarChart2 size={16} style={{ color: "var(--text-muted)" }} />
          </div>
          {/* SVG Bar Chart */}
          <svg viewBox="0 0 400 140" className="w-full">
            {["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => {
              const heights = [60, 90, 70, 110, 85, 120];
              const h = heights[i];
              return (
                <g key={m}>
                  <rect x={20 + i * 62} y={140 - h} width={36} height={h} rx={6}
                    fill={i === 5 ? "var(--blue)" : "var(--blue-muted)"} />
                  <text x={38 + i * 62} y={136} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{m}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* System health */}
        <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>System Health</h3>
          <div className="space-y-3">
            {[
              { label: "Server Uptime", val: 99, color: "var(--blue)" },
              { label: "DB Performance", val: 87, color: "var(--green-text)" },
              { label: "API Response",   val: 92, color: "var(--yellow-text)" },
              { label: "Storage Used",   val: 64, color: "var(--red-text)" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-body)" }}>{m.label}</span>
                  <span style={{ color: m.color }}>{m.val}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card-3d rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recently Joined Users</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
          {recentUsers.map((u) => (
            <div key={u.email} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--blue)" }}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                  style={{ backgroundColor: roleBg[u.role], color: roleColor[u.role] }}>
                  {u.role}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{u.joined}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
