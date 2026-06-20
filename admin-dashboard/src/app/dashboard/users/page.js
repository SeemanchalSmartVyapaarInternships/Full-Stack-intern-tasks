"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { Search, UserPlus, Trash2, Edit } from "lucide-react";
import { useState } from "react";

const mockUsers = [
  { id: 1, name: "Rahul Sharma",  email: "rahul@sv.com",  role: "manager",  status: "active",   joined: "2026-01-12" },
  { id: 2, name: "Priya Singh",   email: "priya@sv.com",  role: "employee", status: "active",   joined: "2026-02-08" },
  { id: 3, name: "Amit Verma",    email: "amit@sv.com",   role: "employee", status: "inactive", joined: "2026-03-15" },
  { id: 4, name: "Neha Gupta",    email: "neha@sv.com",   role: "manager",  status: "active",   joined: "2026-03-22" },
  { id: 5, name: "Kiran Patel",   email: "kiran@sv.com",  role: "employee", status: "active",   joined: "2026-04-05" },
  { id: 6, name: "Deepak Joshi",  email: "deepak@sv.com", role: "employee", status: "on-leave", joined: "2026-04-18" },
  { id: 7, name: "Sonal Mehta",   email: "sonal@sv.com",  role: "admin",    status: "active",   joined: "2026-05-02" },
];

const roleBg   = { admin: "var(--blue-bg)",   manager: "var(--green-bg)",   employee: "var(--input-bg)" };
const roleColor = { admin: "var(--blue-text)", manager: "var(--green-text)", employee: "var(--text-muted)" };
const statusBg  = { active: "var(--green-bg)", inactive: "var(--red-bg)", "on-leave": "var(--yellow-bg)" };
const statusClr = { active: "var(--green-text)", inactive: "var(--red-text)", "on-leave": "var(--yellow-text)" };

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>User Management</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{mockUsers.length} registered users</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--blue)" }}>
            <UserPlus size={15} /> Add User
          </button>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <div className="relative max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                suppressHydrationWarning
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  {["User","Email","Role","Status","Joined","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--divider)" : "none" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: "var(--blue)" }}>{u.name.charAt(0)}</div>
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ backgroundColor: roleBg[u.role], color: roleColor[u.role] }}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ backgroundColor: statusBg[u.status], color: statusClr[u.status] }}>{u.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{u.joined}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--blue-bg)", color: "var(--blue-text)" }}><Edit size={13} /></button>
                        <button className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--red-bg)", color: "var(--red-text)" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
