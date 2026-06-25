"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Users2, FolderKanban, CheckCircle2, Clock, TrendingUp, Loader2 } from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const cardsRef = useRef([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [teamRes, projRes, tasksRes] = await Promise.all([
          apiFetch("/users/team"),
          apiFetch("/projects?limit=100"),
          apiFetch("/tasks?limit=100"),
        ]);

        const team = teamRes.data || [];
        const projects = projRes.data || [];
        const tasks = tasksRes.data || [];

        const projectPipeline = {};
        projects.forEach(p => { projectPipeline[p.status] = (projectPipeline[p.status] || 0) + 1; });

        const tasksDone = tasks.filter(t => t.status === "done").length;
        const tasksPending = tasks.filter(t => t.status === "todo" || t.status === "in_progress").length;

        setData({
          team,
          totalTeam: team.length,
          totalProjects: projects.length,
          tasksDone,
          tasksPending,
          projectPipeline,
        });
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
    { id: "team",   label: "Team Members",   value: data?.totalTeam || 0,    Icon: Users2,       bg: "var(--icon-blue)",   color: "var(--blue-text)" },
    { id: "proj",   label: "Active Projects", value: data?.totalProjects || 0, Icon: FolderKanban, bg: "var(--icon-green)",  color: "var(--green-text)" },
    { id: "done",   label: "Tasks Completed", value: data?.tasksDone || 0,    Icon: CheckCircle2, bg: "var(--icon-purple)", color: "#7c3aed" },
    { id: "pend",   label: "Tasks Pending",   value: data?.tasksPending || 0, Icon: Clock,        bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
  ];

  const pipelineLabels = { planning: "Planning", active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };
  const pipelineColors = { planning: "var(--blue)", active: "var(--green-text)", on_hold: "var(--yellow-text)", completed: "#7c3aed", cancelled: "var(--red-text)" };
  const maxPipeline = Math.max(...Object.values(data?.projectPipeline || { x: 1 }), 1);

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
        {statCards.map((s, i) => (
          <div key={s.id} ref={(el) => (cardsRef.current[i] = el)}
            className="card-3d rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Project pipeline + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Project Pipeline</h3>
          <div className="space-y-3">
            {Object.entries(pipelineLabels).map(([key, label]) => {
              const count = data?.projectPipeline?.[key] || 0;
              const pct = Math.round((count / maxPipeline) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--text-body)" }}>{label}</span>
                    <span style={{ color: pipelineColors[key] }}>{count} project{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: "var(--input-bg)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pipelineColors[key] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team list */}
        <div className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Team Members</h3>
          <div className="space-y-3">
            {(data?.team || []).slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--blue)" }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.email}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{
                    backgroundColor: m.role === "manager" ? "var(--green-bg)" : "var(--input-bg)",
                    color: m.role === "manager" ? "var(--green-text)" : "var(--text-muted)",
                  }}>{m.role}</span>
              </div>
            ))}
            {(data?.team || []).length === 0 && (
              <div className="text-center py-6 text-sm" style={{ color: "var(--text-muted)" }}>No team members yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
