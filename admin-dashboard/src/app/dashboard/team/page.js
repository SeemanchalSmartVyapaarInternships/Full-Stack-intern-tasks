"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { Phone, Mail, Star } from "lucide-react";

const teamMembers = [
  { id: 1, name: "Rahul Sharma",  role: "manager",  dept: "Sales",      orders: 56, rating: 4.8, status: "active",   phone: "+91 98765 43210" },
  { id: 2, name: "Priya Singh",   role: "employee", dept: "Support",    orders: 38, rating: 4.5, status: "active",   phone: "+91 87654 32109" },
  { id: 3, name: "Amit Verma",    role: "employee", dept: "Delivery",   orders: 71, rating: 4.2, status: "active",   phone: "+91 76543 21098" },
  { id: 4, name: "Neha Gupta",    role: "manager",  dept: "Operations", orders: 44, rating: 4.9, status: "active",   phone: "+91 65432 10987" },
  { id: 5, name: "Kiran Patel",   role: "employee", dept: "Delivery",   orders: 62, rating: 4.0, status: "on-leave", phone: "+91 54321 09876" },
  { id: 6, name: "Deepak Joshi",  role: "employee", dept: "Sales",      orders: 29, rating: 3.8, status: "inactive", phone: "+91 43210 98765" },
];

const roleBg   = { manager: "var(--blue-bg)",  employee: "var(--input-bg)" };
const roleColor = { manager: "var(--blue-text)", employee: "var(--text-muted)" };
const statusColor = { active: "var(--green-text)", "on-leave": "var(--yellow-text)", inactive: "var(--red-text)" };
const statusBg    = { active: "var(--green-bg)",   "on-leave": "var(--yellow-bg)",   inactive: "var(--red-bg)" };

export default function TeamPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Team</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{teamMembers.length} team members</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Members", value: teamMembers.length },
            { label: "Active Now",    value: teamMembers.filter(m => m.status === "active").length },
            { label: "On Leave",      value: teamMembers.filter(m => m.status === "on-leave").length },
          ].map((s) => (
            <div key={s.label} className="card-3d rounded-xl p-4 text-center" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teamMembers.map((m) => (
            <div key={m.id} className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--blue)" }}>{m.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.dept}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: statusBg[m.status], color: statusColor[m.status] }}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{ backgroundColor: roleBg[m.role], color: roleColor[m.role] }}>{m.role}</span>
                <div className="flex items-center gap-0.5">
                  <Star size={11} style={{ color: "var(--yellow-text)" }} fill="var(--yellow-text)" />
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.rating}</span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.orders} orders</span>
              </div>
              <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
                <Phone size={12} style={{ color: "var(--text-muted)" }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
