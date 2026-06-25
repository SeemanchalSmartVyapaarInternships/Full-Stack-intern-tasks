"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users, FolderKanban, ListTodo, Building2, BarChart2, Loader2 } from "lucide-react";

const roleBgMap   = { admin: "var(--blue-bg)",   manager: "var(--green-bg)",   employee: "var(--input-bg)" };
const roleClrMap  = { admin: "var(--blue-text)", manager: "var(--green-text)", employee: "var(--text-muted)" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const cardsRef = useRef([]);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, deptsRes, projRes, tasksRes] = await Promise.all([
          apiFetch("/users/all"),
          apiFetch("/departments?limit=1"),
          apiFetch("/projects?limit=1"),
          apiFetch("/tasks?limit=1"),
        ]);

        setStats({
          users: usersRes.data?.length || usersRes.count || 0,
          departments: deptsRes.pagination?.total || 0,
          projects: projRes.pagination?.total || 0,
          tasks: tasksRes.pagination?.total || 0,
        });

        // Get 5 most recent users
        const sorted = (usersRes.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentUsers(sorted);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current.filter(Boolean).length > 0) {
      gsap.fromTo(cardsRef.current.filter(Boolean),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "back.out(1.4)", clearProps: "transform" }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
      </div>
    );
  }

  const statCards = [
    { id: "users",  label: "Total Users",    value: stats?.users || 0,       Icon: Users,        bg: "var(--icon-blue)",   color: "var(--blue-text)" },
    { id: "depts",  label: "Departments",    value: stats?.departments || 0, Icon: Building2,    bg: "var(--icon-green)",  color: "var(--green-text)" },
    { id: "proj",   label: "Projects",       value: stats?.projects || 0,    Icon: FolderKanban, bg: "var(--icon-purple)", color: "#7c3aed" },
    { id: "tasks",  label: "Tasks",          value: stats?.tasks || 0,       Icon: ListTodo,     bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Dashboard</h1>
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
        {statCards.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => (cardsRef.current[i] = el)}
            className="card-3d rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="card-3d rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recently Joined Users</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
          {recentUsers.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>No users yet.</div>
          ) : recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
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
                  style={{ backgroundColor: roleBgMap[u.role], color: roleClrMap[u.role] }}>
                  {u.role}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
