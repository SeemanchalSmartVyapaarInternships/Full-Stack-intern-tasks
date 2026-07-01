"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ClipboardList, CheckCircle2, FolderKanban, Clock, Loader2, X, MessageSquare } from "lucide-react";

const priorityColor = { high: "var(--red-text)", medium: "var(--yellow-text)", low: "var(--blue-text)", critical: "var(--red-text)" };
const priorityBg    = { high: "var(--red-bg)",   medium: "var(--yellow-bg)",   low: "var(--blue-bg)",  critical: "var(--red-bg)" };
const statusColor   = { todo: "var(--text-muted)", in_progress: "var(--blue-text)", in_review: "var(--yellow-text)", done: "var(--green-text)", cancelled: "var(--red-text)" };
const statusLabel   = { todo: "To Do", in_progress: "In Progress", in_review: "Review", done: "Done", cancelled: "Cancelled" };

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const cardsRef = useRef([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [commentUpdate, setCommentUpdate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const loadData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        apiFetch("/projects?limit=100"),
        apiFetch("/tasks?limit=100"),
      ]);
      setProjects(projRes.data || []);
      setTasks(taskRes.data || []);
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current.filter(Boolean).length > 0) {
      gsap.fromTo(cardsRef.current.filter(Boolean),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "back.out(1.4)", clearProps: "transform" }
      );
    }
  }, [loading]);

  async function handleStatusSubmit(e) {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    try {
      await apiFetch(`/tasks/${selectedTask.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusUpdate,
          comment: commentUpdate || null
        })
      });
      setSelectedTask(null);
      await loadData();
    } catch (err) {
      setUpdateError(err.message || "Failed to update task.");
    } finally {
      setUpdating(false);
    }
  }

  function openUpdateModal(task) {
    setSelectedTask(task);
    setStatusUpdate(task.status);
    setCommentUpdate(task.comment || "");
    setUpdateError("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status !== "done" && t.status !== "cancelled");
  const doneTasks = tasks.filter(t => t.status === "done");

  const stats = [
    { id: "tasks",    label: "Active Tasks",    value: activeTasks.length,   Icon: ClipboardList, bg: "var(--icon-blue)",   color: "var(--blue-text)" },
    { id: "done",     label: "Completed",        value: doneTasks.length,     Icon: CheckCircle2,  bg: "var(--icon-green)",  color: "var(--green-text)" },
    { id: "projects", label: "My Projects",      value: projects.length,      Icon: FolderKanban,  bg: "var(--icon-purple)", color: "#7c3aed" },
    { id: "pending",  label: "Due Soon",         value: tasks.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 3*86400000) && t.status !== "done").length, Icon: Clock, bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>My Workspace</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Welcome, {user?.name}. Here&apos;s your personal overview.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: "var(--input-bg)", color: "var(--text-muted)" }}>
          Employee
        </span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.id} ref={(el) => (cardsRef.current[i] = el)}
            className="card-3d rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-3d rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--divider)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>My Tasks</h3>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Click task to update status & comments</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>No tasks assigned.</div>
            ) : tasks.slice(0, 10).map((t) => (
              <div key={t.id} onClick={() => openUpdateModal(t)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/5 dark:hover:bg-slate-800/20 transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: t.status === "done" ? "var(--green-text)" : "var(--border-color)" }}>
                    {t.status === "done" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--green-text)" }} />}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{
                      color: t.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: t.status === "done" ? "line-through" : "none"
                    }}>{t.title}</p>
                    {t.comment && (
                      <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                        <MessageSquare size={10} /> {t.comment}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: priorityBg[t.priority], color: priorityColor[t.priority] }}>
                    {t.priority}
                  </span>
                  <span className="text-[10px]" style={{ color: statusColor[t.status] }}>
                    {statusLabel[t.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-3d rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>My Projects</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
            {projects.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>No projects yet.</div>
            ) : projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.department?.name || "No department"}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold"
                  style={{
                    backgroundColor: p.status === "active" ? "var(--green-bg)" : p.status === "completed" ? "var(--icon-purple)" : "var(--blue-bg)",
                    color: p.status === "active" ? "var(--green-text)" : p.status === "completed" ? "#7c3aed" : "var(--blue-text)",
                  }}>
                  {p.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Update Task Progress</h2>
              <button onClick={() => setSelectedTask(null)} style={{ color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {updateError && (
              <div className="px-3 py-2 rounded-xl mb-4 text-xs" style={{ backgroundColor: "var(--red-bg)", color: "var(--red-text)" }}>
                {updateError}
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Task</label>
                <div className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-primary)" }}>
                  {selectedTask.title}
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Description</label>
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-secondary)" }}>
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Project</label>
                  <div className="text-xs px-3 py-2 rounded-lg truncate" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-secondary)" }}>
                    {selectedTask.project?.name || "None"}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Priority</label>
                  <div className="text-xs px-3 py-2 rounded-lg capitalize" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-secondary)" }}>
                    {selectedTask.priority}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Status</label>
                <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Add Progress Update / Comment</label>
                <textarea value={commentUpdate} onChange={(e) => setCommentUpdate(e.target.value)} rows={3}
                  placeholder="Report your progress here..."
                  className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none resize-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}>Cancel</button>
                <button type="submit" disabled={updating}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--blue)" }}>
                  {updating ? "Saving..." : "Submit Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
