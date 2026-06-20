"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { Users2, ShoppingCart, CheckCircle2, Clock, ArrowUpRight, TrendingUp } from "lucide-react";

const stats = [
  { id: "team",      label: "Team Members", value: "24",    change: "+2 this month",  Icon: Users2,       bg: "var(--icon-blue)",   color: "var(--blue-text)" },
  { id: "orders",   label: "Active Orders", value: "348",   change: "+28 today",      Icon: ShoppingCart, bg: "var(--icon-green)",  color: "var(--green-text)" },
  { id: "done",     label: "Completed",     value: "1,247", change: "This month",     Icon: CheckCircle2, bg: "var(--icon-purple)", color: "#7c3aed" },
  { id: "pending",  label: "Pending Tasks", value: "56",    change: "Due this week",  Icon: Clock,        bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
];

const pipeline = [
  { label: "New",         count: 42, color: "var(--blue)" },
  { label: "Processing",  count: 87, color: "var(--yellow-text)" },
  { label: "Shipped",     count: 63, color: "#7c3aed" },
  { label: "Delivered",   count: 156, color: "var(--green-text)" },
  { label: "Cancelled",   count: 12, color: "var(--red-text)" },
];

const teamMembers = [
  { name: "Priya Singh",   role: "Sales Lead",     orders: 56, status: "active" },
  { name: "Amit Verma",    role: "Field Agent",    orders: 43, status: "active" },
  { name: "Neha Gupta",    role: "Support",        orders: 38, status: "on-leave" },
  { name: "Kiran Patel",   role: "Delivery Agent", orders: 71, status: "active" },
];

export default function ManagerDashboard() {
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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Manager Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Hello {user?.name} — your team & workflow overview.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: "var(--green-bg)", color: "var(--green-text)" }}>
          Manager Access
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.id} ref={(el) => (cardsRef.current[i] = el)}
            className="card-3d rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.Icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.change}</p>
          </div>
        ))}
      </div>

      {/* Order pipeline + Team table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline */}
        <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Order Pipeline
          </h3>
          <div className="space-y-3">
            {pipeline.map((p) => {
              const pct = Math.round((p.count / 360) * 100);
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--text-body)" }}>{p.label}</span>
                    <span style={{ color: p.color }}>{p.count} orders</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team performance */}
        <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Team Performance</h3>
          <div className="space-y-3">
            {teamMembers.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--blue)" }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{m.orders}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: m.status === "active" ? "var(--green-bg)" : "var(--yellow-bg)",
                      color: m.status === "active" ? "var(--green-text)" : "var(--yellow-text)"
                    }}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} style={{ color: "var(--blue)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Today&apos;s Activity</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Orders Placed",   value: "28", color: "var(--blue)" },
            { label: "Orders Delivered",value: "19", color: "var(--green-text)" },
            { label: "Issues Raised",   value: "3",  color: "var(--red-text)" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl py-4" style={{ backgroundColor: "var(--input-bg)" }}>
              <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
