"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, ListTodo, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, Edit, X } from "lucide-react";
import { apiFetch, buildQuery } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/auth/RoleGuard";

const statusBg  = { todo: "var(--input-bg)", in_progress: "var(--blue-bg)", in_review: "var(--yellow-bg)", done: "var(--green-bg)", cancelled: "var(--red-bg)" };
const statusClr = { todo: "var(--text-muted)", in_progress: "var(--blue-text)", in_review: "var(--yellow-text)", done: "var(--green-text)", cancelled: "var(--red-text)" };
const priBg     = { low: "var(--input-bg)", medium: "var(--blue-bg)", high: "var(--yellow-bg)", critical: "var(--red-bg)" };
const priClr    = { low: "var(--text-muted)", medium: "var(--blue-text)", high: "var(--yellow-text)", critical: "var(--red-text)" };

const allStatuses = ["all", "todo", "in_progress", "in_review", "done", "cancelled"];

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);
  
  // Advanced filters state
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [form, setForm] = useState({ title: "", description: "", priority: "medium", projectId: "", assigneeId: "", dueDate: "", comment: "" });
  const [editForm, setEditForm] = useState({ title: "", description: "", priority: "medium", status: "todo", projectId: "", assigneeId: "", dueDate: "", comment: "" });
  
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery({
        page,
        limit: 10,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        projectId: projectFilter || undefined,
        assigneeId: assigneeFilter || undefined,
        priority: priorityFilter || undefined,
        sort,
      });
      const data = await apiFetch(`/tasks${q}`);
      setTasks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, projectFilter, assigneeFilter, priorityFilter]);

  // Load filter inputs lists once on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const [projData, assigneeData] = await Promise.all([
          apiFetch("/projects?limit=100"),
          user?.role === "admin" ? apiFetch("/users/managers") : apiFetch("/users/employees"),
        ]);
        setProjects(projData.data || []);
        setAssignees(assigneeData.data || []);
      } catch {}
    }
    if (user) {
      loadFilters();
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchTasks(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  async function openCreateModal() {
    setShowCreate(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        projectId: form.projectId,
        assigneeId: form.assigneeId || undefined,
        dueDate: form.dueDate || undefined,
        comment: form.comment || undefined,
      };
      await apiFetch("/tasks", { method: "POST", body: JSON.stringify(payload) });
      setShowCreate(false);
      setForm({ title: "", description: "", priority: "medium", projectId: "", assigneeId: "", dueDate: "", comment: "" });
      fetchTasks(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function openEditModal(task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      projectId: task.projectId || "",
      assigneeId: task.assigneeId || "",
      dueDate: task.dueDate || "",
      comment: task.comment || "",
    });
    setShowEdit(true);
    try {
      const [projData, assigneeData] = await Promise.all([
        apiFetch("/projects?limit=100"),
        user?.role === "admin" ? apiFetch("/users/managers") : apiFetch("/users/employees"),
      ]);
      setProjects(projData.data || []);
      setAssignees(assigneeData.data || []);
    } catch {}
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description || null,
        priority: editForm.priority,
        status: editForm.status,
        projectId: editForm.projectId || null,
        assigneeId: editForm.assigneeId || null,
        dueDate: editForm.dueDate || null,
        comment: editForm.comment || null,
      };
      await apiFetch(`/tasks/${editingTask.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      setShowEdit(false);
      setEditingTask(null);
      fetchTasks(pagination.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  function toggleSort(field) {
    setSort(prev => prev === field ? `-${field}` : prev === `-${field}` ? field : field);
  }

  const total = pagination.total;
  const assigneeLabel = user?.role === "admin" ? "Allocate to Manager" : "Assign to Employee";

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Tasks</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {total} task{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <button onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--blue)" }}>
            <Plus size={15} /> New Task
          </button>
        </div>

        <div className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..." suppressHydrationWarning
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)" }}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)" }}>
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)" }}>
                <option value="">All Assignees</option>
                {assignees.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {allStatuses.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={status === s
                    ? { backgroundColor: "var(--blue)", color: "#fff" }
                    : { backgroundColor: "var(--input-bg)", color: "var(--text-muted)" }}>
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-sm" style={{ color: "var(--red-text)" }}>{error}</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>No tasks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                    {[
                      { label: "Task", field: "title" },
                      { label: "Project", field: null },
                      { label: "Assignee", field: null },
                      { label: "Priority", field: "priority" },
                      { label: "Status", field: "status" },
                      { label: "Due Date", field: "dueDate" },
                      { label: "Actions", field: null },
                    ].map(h => (
                      <th key={h.label}
                        className={`text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider ${h.field ? "cursor-pointer select-none" : ""}`}
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => h.field && toggleSort(h.field)}>
                        <span className="flex items-center gap-1">
                          {h.label}
                          {h.field && <ArrowUpDown size={11} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, i) => (
                    <tr key={t.id} className="transition-colors animate-fade-in" style={{ borderBottom: i < tasks.length - 1 ? "1px solid var(--divider)" : "none" }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "var(--icon-purple)" }}>
                            <ListTodo size={14} style={{ color: "#7c3aed" }} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>{t.title}</span>
                            {t.description && (
                              <span className="text-[10px] block truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>{t.description}</span>
                            )}
                            {t.comment && (
                              <span className="text-[9px] block text-blue-500 font-medium max-w-[200px] truncate" style={{ color: "var(--blue-text)" }}>
                                Update: {t.comment}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {t.project?.name || "-"}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {t.assignee?.name || "Unassigned"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                          style={{ backgroundColor: priBg[t.priority], color: priClr[t.priority] }}>{t.priority}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                          style={{ backgroundColor: statusBg[t.status], color: statusClr[t.status] }}>{t.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => openEditModal(t)}
                          className="p-1 rounded hover:bg-slate-50/10 transition-colors"
                          style={{ color: "var(--blue)" }}>
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--divider)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button disabled={!pagination.hasPrevPage} onClick={() => fetchTasks(pagination.page - 1)}
                  className="p-1.5 rounded-lg disabled:opacity-40" style={{ backgroundColor: "var(--input-bg)" }}>
                  <ChevronLeft size={14} style={{ color: "var(--text-muted)" }} />
                </button>
                <button disabled={!pagination.hasNextPage} onClick={() => fetchTasks(pagination.page + 1)}
                  className="p-1.5 rounded-lg disabled:opacity-40" style={{ backgroundColor: "var(--input-bg)" }}>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>New Task</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required placeholder="Task Title" value={form.title} suppressHydrationWarning
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />

                <textarea placeholder="Task Description" value={form.description} rows={3}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />

                <div className="grid grid-cols-2 gap-3">
                  <select required value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="">{assigneeLabel}</option>
                    {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                  <input type="date" placeholder="Deadline" value={form.dueDate} suppressHydrationWarning
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
                </div>

                <textarea placeholder="Additional Comments (optional)" value={form.comment} rows={2}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}>Cancel</button>
                  <button type="submit" disabled={creating}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--blue)" }}>
                    {creating ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Edit Task</h2>
                <button onClick={() => setShowEdit(false)} style={{ color: "var(--text-muted)" }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <input required placeholder="Task Title" value={editForm.title} suppressHydrationWarning
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />

                <textarea placeholder="Task Description" value={editForm.description} rows={3}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />

                <div className="grid grid-cols-2 gap-3">
                  <select required value={editForm.projectId} onChange={e => setEditForm({ ...editForm, projectId: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={editForm.assigneeId} onChange={e => setEditForm({ ...editForm, assigneeId: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="">{assigneeLabel}</option>
                    {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input type="date" placeholder="Deadline" value={editForm.dueDate} suppressHydrationWarning
                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
                </div>

                <textarea placeholder="Comments / Progress Update" value={editForm.comment} rows={2}
                  onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowEdit(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}>Cancel</button>
                  <button type="submit" disabled={updating}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--blue)" }}>
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
