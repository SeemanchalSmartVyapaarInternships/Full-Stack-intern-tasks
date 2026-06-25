"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, FolderKanban, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from "lucide-react";
import { apiFetch, buildQuery } from "@/lib/api";

const statusBg  = { planning: "var(--blue-bg)", active: "var(--green-bg)", on_hold: "var(--yellow-bg)", completed: "var(--icon-purple)", cancelled: "var(--red-bg)" };
const statusClr = { planning: "var(--blue-text)", active: "var(--green-text)", on_hold: "var(--yellow-text)", completed: "#7c3aed", cancelled: "var(--red-text)" };
const priBg     = { low: "var(--input-bg)", medium: "var(--blue-bg)", high: "var(--yellow-bg)", critical: "var(--red-bg)" };
const priClr    = { low: "var(--text-muted)", medium: "var(--blue-text)", high: "var(--yellow-text)", critical: "var(--red-text)" };

const allStatuses = ["all", "planning", "active", "on_hold", "completed", "cancelled"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", priority: "medium", startDate: "", endDate: "" });
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery({
        page,
        limit: 10,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        sort,
      });
      const data = await apiFetch(`/projects${q}`);
      setProjects(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProjects(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchProjects]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await apiFetch("/projects", { method: "POST", body: JSON.stringify(form) });
      setShowCreate(false);
      setForm({ name: "", description: "", priority: "medium", startDate: "", endDate: "" });
      fetchProjects(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function toggleSort(field) {
    setSort(prev => prev === field ? `-${field}` : prev === `-${field}` ? field : field);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {pagination.total} project{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--blue)" }}>
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..." suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allStatuses.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={status === s
                  ? { backgroundColor: "var(--blue)", color: "#fff" }
                  : { backgroundColor: "var(--input-bg)", color: "var(--text-muted)" }}>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-sm" style={{ color: "var(--red-text)" }}>{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>No projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  {[
                    { label: "Project", field: "name" },
                    { label: "Department", field: null },
                    { label: "Owner", field: null },
                    { label: "Priority", field: "priority" },
                    { label: "Status", field: "status" },
                    { label: "Created", field: "createdAt" },
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
                {projects.map((p, i) => (
                  <tr key={p.id} className="transition-colors" style={{ borderBottom: i < projects.length - 1 ? "1px solid var(--divider)" : "none" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "var(--blue-bg)" }}>
                          <FolderKanban size={14} style={{ color: "var(--blue-text)" }} />
                        </div>
                        <div>
                          <span className="text-xs font-semibold block" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                          {p.description && (
                            <span className="text-[10px] block truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>{p.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {p.department?.name || "-"}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {p.owner?.name || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ backgroundColor: priBg[p.priority], color: priClr[p.priority] }}>{p.priority}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{ backgroundColor: statusBg[p.status], color: statusClr[p.status] }}>{p.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--divider)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={!pagination.hasPrevPage} onClick={() => fetchProjects(pagination.page - 1)}
                className="p-1.5 rounded-lg disabled:opacity-40" style={{ backgroundColor: "var(--input-bg)" }}>
                <ChevronLeft size={14} style={{ color: "var(--text-muted)" }} />
              </button>
              <button disabled={!pagination.hasNextPage} onClick={() => fetchProjects(pagination.page + 1)}
                className="p-1.5 rounded-lg disabled:opacity-40" style={{ backgroundColor: "var(--input-bg)" }}>
                <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Project name" value={form.name} suppressHydrationWarning
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
              <textarea placeholder="Description (optional)" value={form.description} rows={3}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
              <div className="grid grid-cols-3 gap-3">
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                  <option value="low">Low</option><option value="medium">Medium</option>
                  <option value="high">High</option><option value="critical">Critical</option>
                </select>
                <input type="date" placeholder="Start" value={form.startDate} suppressHydrationWarning
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
                <input type="date" placeholder="End" value={form.endDate} suppressHydrationWarning
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}>Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--blue)" }}>
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
