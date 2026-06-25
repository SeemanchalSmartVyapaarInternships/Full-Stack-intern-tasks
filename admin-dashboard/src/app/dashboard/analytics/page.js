"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { Users, FolderKanban, ListTodo, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, deptsRes, projRes, tasksRes] = await Promise.all([
          apiFetch("/users/all"),
          apiFetch("/departments?limit=1"),
          apiFetch("/projects?limit=1"),
          apiFetch("/tasks?limit=1"),
        ]);

        const users = usersRes.data || [];
        const tasksByStatus = {};
        // Fetch all tasks to compute status breakdown
        const allTasksRes = await apiFetch("/tasks?limit=100");
        const allTasks = allTasksRes.data || [];
        allTasks.forEach(t => { tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1; });

        const projectsByStatus = {};
        const allProjRes = await apiFetch("/projects?limit=100");
        const allProjs = allProjRes.data || [];
        allProjs.forEach(p => { projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1; });

        setStats({
          totalUsers: users.length,
          totalDepts: deptsRes.pagination?.total || 0,
          totalProjects: projRes.pagination?.total || 0,
          totalTasks: tasksRes.pagination?.total || 0,
          roleBreakdown: {
            admin: users.filter(u => u.role === "admin").length,
            manager: users.filter(u => u.role === "manager").length,
            employee: users.filter(u => u.role === "employee").length,
          },
          tasksByStatus,
          projectsByStatus,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <div className="text-center py-20 text-sm" style={{ color: "var(--red-text)" }}>{error}</div>
      </RoleGuard>
    );
  }

  const kpis = [
    { label: "Total Users",       value: stats.totalUsers,    Icon: Users,        bg: "var(--icon-blue)",   color: "var(--blue-text)" },
    { label: "Departments",       value: stats.totalDepts,    Icon: Building2,    bg: "var(--icon-green)",  color: "var(--green-text)" },
    { label: "Projects",          value: stats.totalProjects, Icon: FolderKanban, bg: "var(--icon-purple)", color: "#7c3aed" },
    { label: "Tasks",             value: stats.totalTasks,    Icon: ListTodo,     bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
  ];

  const taskStatusLabels = { todo: "To Do", in_progress: "In Progress", in_review: "In Review", done: "Done", cancelled: "Cancelled" };
  const taskStatusColors = { todo: "var(--text-muted)", in_progress: "var(--blue)", in_review: "var(--yellow-text)", done: "var(--green-text)", cancelled: "var(--red-text)" };

  const projStatusLabels = { planning: "Planning", active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };
  const projStatusColors = { planning: "var(--blue-text)", active: "var(--green-text)", on_hold: "var(--yellow-text)", completed: "#7c3aed", cancelled: "var(--red-text)" };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>System-wide overview — live data</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: k.bg }}>
                <k.Icon size={18} style={{ color: k.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Task status breakdown */}
          <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Tasks by Status</h3>
            <div className="space-y-3">
              {Object.entries(taskStatusLabels).map(([key, label]) => {
                const count = stats.tasksByStatus[key] || 0;
                const pct = stats.totalTasks > 0 ? Math.round((count / stats.totalTasks) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-body)" }}>{label}</span>
                      <span style={{ color: taskStatusColors[key] }}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: taskStatusColors[key] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project status breakdown */}
          <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Projects by Status</h3>
            <div className="space-y-3">
              {Object.entries(projStatusLabels).map(([key, label]) => {
                const count = stats.projectsByStatus[key] || 0;
                const pct = stats.totalProjects > 0 ? Math.round((count / stats.totalProjects) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-body)" }}>{label}</span>
                      <span style={{ color: projStatusColors[key] }}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: projStatusColors[key] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role distribution */}
          <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Users by Role</h3>
            <div className="space-y-3">
              {[
                { label: "Admin",    count: stats.roleBreakdown.admin,    color: "var(--blue)" },
                { label: "Manager",  count: stats.roleBreakdown.manager,  color: "var(--green-text)" },
                { label: "Employee", count: stats.roleBreakdown.employee, color: "var(--yellow-text)" },
              ].map(r => {
                const pct = stats.totalUsers > 0 ? Math.round((r.count / stats.totalUsers) * 100) : 0;
                return (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-body)" }}>{r.label}</span>
                      <span style={{ color: r.color }}>{r.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
