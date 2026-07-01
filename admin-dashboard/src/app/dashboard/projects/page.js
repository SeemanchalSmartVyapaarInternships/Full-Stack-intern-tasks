"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, FolderKanban, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, X, Download, Trash2, UserPlus, FileText, Users, Calendar, Shield } from "lucide-react";
import { apiFetch, buildQuery } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const statusBg  = { planning: "var(--blue-bg)", active: "var(--green-bg)", on_hold: "var(--yellow-bg)", completed: "var(--icon-purple)", cancelled: "var(--red-bg)" };
const statusClr = { planning: "var(--blue-text)", active: "var(--green-text)", on_hold: "var(--yellow-text)", completed: "#7c3aed", cancelled: "var(--red-text)" };
const priBg     = { low: "var(--input-bg)", medium: "var(--blue-bg)", high: "var(--yellow-bg)", critical: "var(--red-bg)" };
const priClr    = { low: "var(--text-muted)", medium: "var(--blue-text)", high: "var(--yellow-text)", critical: "var(--red-text)" };

const allStatuses = ["all", "planning", "active", "on_hold", "completed", "cancelled"];

export default function ProjectsPage() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", priority: "medium", startDate: "", endDate: "", departmentId: "" });
  const [creating, setCreating] = useState(false);

  // Advanced Filtering
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Detail Modal / WorkSpace
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  // Add Member
  const [teamList, setTeamList] = useState([]);
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("developer");

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery({
        page,
        limit: 10,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        priority: priorityFilter || undefined,
        departmentId: deptFilter || undefined,
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
  }, [search, status, sort, priorityFilter, deptFilter]);

  // Load departments once
  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await apiFetch("/departments?limit=100");
        setDepartments(res.data || []);
      } catch {}
    }
    loadDepts();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProjects(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchProjects]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        departmentId: form.departmentId || undefined,
      };
      await apiFetch("/projects", { method: "POST", body: JSON.stringify(payload) });
      setShowCreate(false);
      setForm({ name: "", description: "", priority: "medium", startDate: "", endDate: "", departmentId: "" });
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

  // ─── Details Workspace ──────────────────────────────────────────
  const openDetails = async (proj) => {
    setSelectedProject(proj);
    setDetailTab("overview");
    loadProjectDetail(proj.id);
    loadDocuments(proj.id);

    // Load team users list for adding members (admin/manager only)
    if (user?.role === "admin" || user?.role === "manager") {
      try {
        const teamData = await apiFetch("/users/team");
        setTeamList(teamData.data || []);
      } catch {}
    }
  };

  const closeDetails = () => {
    setSelectedProject(null);
    setProjectDetail(null);
    setDocuments([]);
  };

  const loadProjectDetail = async (projectId) => {
    try {
      const res = await apiFetch(`/projects/${projectId}`);
      setProjectDetail(res.data);
    } catch {}
  };

  const loadDocuments = async (projectId) => {
    setDocLoading(true);
    try {
      const res = await apiFetch(`/projects/${projectId}/documents`);
      setDocuments(res.data || []);
    } catch {}
    setDocLoading(false);
  };

  // Upload Project File
  const handleUploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch(`http://localhost:8000/api/projects/${selectedProject.id}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to upload file.");
      } else {
        loadDocuments(selectedProject.id);
      }
    } catch {
      alert("Failed to upload. Server error.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Delete Project File
  const handleDeleteDoc = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await apiFetch(`/projects/documents/${docId}`, { method: "DELETE" });
      loadDocuments(selectedProject.id);
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Member to Project
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberUserId) return;
    try {
      await apiFetch(`/projects/${selectedProject.id}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: newMemberUserId, role: newMemberRole }),
      });
      setNewMemberUserId("");
      loadProjectDetail(selectedProject.id);
    } catch (err) {
      alert(err.message);
    }
  };

  // Remove Member from Project
  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await apiFetch(`/projects/${selectedProject.id}/members/${userId}`, { method: "DELETE" });
      loadProjectDetail(selectedProject.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {pagination.total} project{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "manager") && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--blue)" }}>
            <Plus size={15} /> New Project
          </button>
        )}
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
            {/* Priority Filter */}
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)" }}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Department Filter */}
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)" }}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border-l pl-3 flex-wrap" style={{ borderColor: "var(--divider)" }}>
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
                  <tr key={p.id} onClick={() => openDetails(p)}
                    className="transition-colors hover:bg-slate-50/5 cursor-pointer"
                    style={{ borderBottom: i < projects.length - 1 ? "1px solid var(--divider)" : "none" }}>
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

      {/* ─── Project Details Workspace Dialog ─────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl shadow-2xl flex flex-col p-6 animate-slide-in overflow-y-auto"
            style={{ backgroundColor: "var(--card-bg)", borderLeft: "1px solid var(--card-border)" }}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: "var(--divider)" }}>
              <div className="flex items-center gap-3">
                <FolderKanban size={22} style={{ color: "var(--blue)" }} />
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{selectedProject.name}</h2>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Project Workspace</p>
                </div>
              </div>
              <button onClick={closeDetails} className="p-1.5 rounded-lg hover:bg-slate-100/10" style={{ color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Project Quick Badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                style={{ backgroundColor: priBg[selectedProject.priority], color: priClr[selectedProject.priority] }}>
                Priority: {selectedProject.priority}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                style={{ backgroundColor: statusBg[selectedProject.status], color: statusClr[selectedProject.status] }}>
                Status: {selectedProject.status.replace("_", " ")}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 border-b pb-px mb-4" style={{ borderColor: "var(--divider)" }}>
              {[
                { id: "overview", label: "Overview", icon: Calendar },
                { id: "members", label: "Members", icon: Users },
                { id: "documents", label: "Documents", icon: FileText }
              ].map(t => {
                const TabIcon = t.icon;
                return (
                  <button key={t.id} onClick={() => setDetailTab(t.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all"
                    style={detailTab === t.id
                      ? { color: "var(--blue)", borderBottomColor: "var(--blue)" }
                      : { color: "var(--text-muted)", borderBottomColor: "transparent" }}>
                    <TabIcon size={12} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
              {detailTab === "overview" && (
                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)" }}>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Description</h4>
                    <p style={{ color: "var(--text-primary)" }}>{selectedProject.description || "No project description provided."}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Owner</p>
                      <p className="font-semibold text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>{selectedProject.owner?.name || "System"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Department</p>
                      <p className="font-semibold text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>{selectedProject.department?.name || "General"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Start Date</p>
                      <p className="font-semibold text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>{selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>End Date</p>
                      <p className="font-semibold text-xs mt-0.5" style={{ color: "var(--text-primary)" }}>{selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>

                  {projectDetail?.tasks && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>Tasks ({projectDetail.tasks.length})</h4>
                      <div className="divide-y rounded-xl overflow-hidden" style={{ border: "1px solid var(--divider)", borderColor: "var(--divider)" }}>
                        {projectDetail.tasks.length === 0 ? (
                          <div className="p-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>No tasks yet.</div>
                        ) : projectDetail.tasks.map(t => (
                          <div key={t.id} className="p-3 flex items-center justify-between text-xs transition-colors hover:bg-slate-50/5">
                            <div>
                              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.title}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Assignee: {t.assignee?.name || "Unassigned"}</p>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold capitalize"
                              style={{ backgroundColor: statusBg[t.status === "todo" ? "planning" : t.status === "in_progress" ? "active" : "completed"], color: statusClr[t.status === "todo" ? "planning" : t.status === "in_progress" ? "active" : "completed"] }}>
                              {t.status.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailTab === "members" && (
                <div className="space-y-4">
                  {/* Add Member Form (Admin/Manager only) */}
                  {(user?.role === "admin" || user?.role === "manager") && (
                    <form onSubmit={handleAddMember} className="p-4 rounded-xl space-y-3"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)" }}>
                      <h4 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Add Project Member</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <select required value={newMemberUserId} onChange={e => setNewMemberUserId(e.target.value)}
                          className="px-3 py-2 rounded-lg text-xs focus:outline-none"
                          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                          <option value="">Select Team User</option>
                          {teamList
                            .filter(tUser => !projectDetail?.members?.some(m => m.id === tUser.id))
                            .map(tUser => (
                              <option key={tUser.id} value={tUser.id}>{tUser.name} ({tUser.role})</option>
                            ))}
                        </select>
                        <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)}
                          className="px-3 py-2 rounded-lg text-xs focus:outline-none"
                          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                          <option value="developer">Developer</option>
                          <option value="designer">Designer</option>
                          <option value="tester">QA Tester</option>
                          <option value="lead">Project Lead</option>
                        </select>
                      </div>
                      <button type="submit"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                        style={{ backgroundColor: "var(--blue)" }}>
                        <UserPlus size={13} /> Add Member
                      </button>
                    </form>
                  )}

                  {/* Members list */}
                  <div className="divide-y rounded-xl overflow-hidden" style={{ border: "1px solid var(--divider)", borderColor: "var(--divider)" }}>
                    {projectDetail?.members?.length === 0 ? (
                      <div className="p-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>No members added yet.</div>
                    ) : projectDetail?.members?.map(m => (
                      <div key={m.id} className="p-3 flex items-center justify-between text-xs transition-colors hover:bg-slate-50/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: "var(--blue)" }}>{m.name.charAt(0)}</div>
                          <div>
                            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                            style={{ backgroundColor: "var(--blue-bg)", color: "var(--blue-text)" }}>
                            {m.ProjectMember?.role || "developer"}
                          </span>
                          {(user?.role === "admin" || user?.role === "manager") && (
                            <button onClick={() => handleRemoveMember(m.id)}
                              className="text-red-500 hover:text-red-600 p-1" title="Remove member">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === "documents" && (
                <div className="space-y-4">
                  {/* Document Upload Widget */}
                  <div className="p-5 border-2 border-dashed rounded-xl text-center flex flex-col items-center justify-center relative cursor-pointer group"
                    style={{ borderColor: "var(--divider)", backgroundColor: "var(--input-bg)" }}>
                    {uploadingDoc ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 size={22} className="animate-spin text-blue-500" />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Uploading document to secure workspace...</p>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-2">
                        <FileText size={24} className="mb-2" style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Click or Drag files here to upload</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Support PDF, DOCX, XLSX, images up to 10MB</p>
                        <input type="file" onChange={handleUploadDoc} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Documents List */}
                  {docLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 size={18} className="animate-spin" style={{ color: "var(--blue)" }} />
                    </div>
                  ) : (
                    <div className="divide-y rounded-xl overflow-hidden" style={{ border: "1px solid var(--divider)", borderColor: "var(--divider)" }}>
                      {documents.length === 0 ? (
                        <div className="p-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>No documents uploaded yet.</div>
                      ) : documents.map(d => (
                        <div key={d.id} className="p-3 flex items-center justify-between text-xs transition-colors hover:bg-slate-50/5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <FileText size={15} className="shrink-0" style={{ color: "var(--blue)" }} />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>{d.fileName}</p>
                              <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                                {formatBytes(d.fileSize)} · Uploaded by {d.uploader?.name || "System"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-slate-100/10 flex items-center" style={{ color: "var(--blue)" }}>
                              <Download size={13} />
                            </a>
                            {(user?.role === "admin" || user?.role === "manager" || user?.id === d.userId) && (
                              <button onClick={() => handleDeleteDoc(d.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100/10 text-red-500 hover:text-red-600 flex items-center">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              
              <div className="grid grid-cols-2 gap-3">
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="px-3 py-2.5 rounded-xl text-sm focus:outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>

                <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  className="px-3 py-2.5 rounded-xl text-sm focus:outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Start Date</label>
                  <input type="date" value={form.startDate} suppressHydrationWarning
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>End Date</label>
                  <input type="date" value={form.endDate} suppressHydrationWarning
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}>Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
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
