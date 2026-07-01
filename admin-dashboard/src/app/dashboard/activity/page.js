"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, Download, FileText, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch, buildQuery } from "@/lib/api";
import RoleGuard from "@/components/auth/RoleGuard";

const tabs = [
  { id: "activity", label: "User Action Logs" },
  { id: "login", label: "Login History" },
  { id: "upload", label: "Upload History" },
  { id: "tasks", label: "Task Updates" },
];

export default function ActivityLogsPage() {
  const [activeTab, setActiveTab] = useState("activity");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  
  // Query params
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [filterType, setFilterType] = useState(""); // entityType, status, uploadType, etc.

  // Fetch helper
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      let endpoint = "/activities";
      const params = { page, limit: 10, sort };

      if (search) {
        params.search = search;
      }

      if (activeTab === "activity") {
        endpoint = "/activities";
        if (filterType) params.entityType = filterType;
      } else if (activeTab === "login") {
        endpoint = "/activities/login-history";
        if (filterType) params.status = filterType;
      } else if (activeTab === "upload") {
        endpoint = "/activities/upload-history";
        if (filterType) params.uploadType = filterType;
      } else if (activeTab === "tasks") {
        endpoint = "/activities/task-updates";
      }

      const q = buildQuery(params);
      const res = await apiFetch(`${endpoint}${q}`);
      setData(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to retrieve logs.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, sort, filterType]);

  // Refetch when tab/search/sort/filter changes
  useEffect(() => {
    const timeout = setTimeout(() => fetchData(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  // Reset filters when tab changes
  useEffect(() => {
    setSearch("");
    setSort("-createdAt");
    setFilterType("");
  }, [activeTab]);

  function toggleSort(field) {
    setSort(prev => prev === field ? `-${field}` : prev === `-${field}` ? field : field);
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Activity & Audit Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Review enterprise action logs, authentication logs, file history, and task history.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-1.5 border-b pb-px" style={{ borderColor: "var(--divider)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="px-4 py-2 text-xs font-semibold border-b-2 transition-all capitalize"
              style={activeTab === t.id
                ? { color: "var(--blue)", borderBottomColor: "var(--blue)" }
                : { color: "var(--text-muted)", borderBottomColor: "transparent" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtering & Searching toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 card-3d rounded-xl"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tabs.find(t => t.id === activeTab).label.toLowerCase()}...`} suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>

          {activeTab === "activity" && (
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
              <option value="">All Entities</option>
              <option value="project">Projects</option>
              <option value="task">Tasks</option>
              <option value="user">Profile/Users</option>
              <option value="document">Documents</option>
              <option value="auth">Auth Events</option>
            </select>
          )}

          {activeTab === "login" && (
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          )}

          {activeTab === "upload" && (
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }}>
              <option value="">All Upload Types</option>
              <option value="profile_image">Profile Pictures</option>
              <option value="project_document">Project Documents</option>
            </select>
          )}
        </div>

        {/* Data display cards */}
        <div className="card-3d rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-sm" style={{ color: "var(--red-text)" }}>{error}</div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-sm" style={{ color: "var(--text-muted)" }}>No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "activity" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                      <th onClick={() => toggleSort("createdAt")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Time <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>User</th>
                      <th onClick={() => toggleSort("action")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Action <ArrowUpDown size={11} /></span>
                      </th>
                      <th onClick={() => toggleSort("entityType")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Entity <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Details</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: idx < data.length - 1 ? "1px solid var(--divider)" : "none" }}>
                        <td className="px-5 py-3 text-xs text-nowrap" style={{ color: "var(--text-muted)" }}>
                          {new Date(row.createdAt).toLocaleString("en-IN", { hour12: true, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3">
                          {row.user ? (
                            <div>
                              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{row.user.name}</p>
                              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{row.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>System / Guest</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono"
                            style={{
                              backgroundColor: row.action.includes("FAILED") ? "var(--red-bg)" : "var(--blue-bg)",
                              color: row.action.includes("FAILED") ? "var(--red-text)" : "var(--blue-text)"
                            }}>
                            {row.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs capitalize" style={{ color: "var(--text-secondary)" }}>
                          {row.entityType}
                        </td>
                        <td className="px-5 py-3 text-xs font-mono max-w-[250px] truncate" title={row.details} style={{ color: "var(--text-body)" }}>
                          {row.details || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {row.ipAddress || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "login" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                      <th onClick={() => toggleSort("createdAt")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Time <ArrowUpDown size={11} /></span>
                      </th>
                      <th onClick={() => toggleSort("email")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Attempt Email <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>User</th>
                      <th onClick={() => toggleSort("status")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Status <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>IP Address</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Browser/Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: idx < data.length - 1 ? "1px solid var(--divider)" : "none" }}>
                        <td className="px-5 py-3 text-xs text-nowrap" style={{ color: "var(--text-muted)" }}>
                          {new Date(row.createdAt).toLocaleString("en-IN", { hour12: true, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {row.email}
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {row.user?.name || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                            {row.status === "success" ? (
                              <span className="flex items-center gap-1" style={{ color: "var(--green-text)" }}>
                                <CheckCircle2 size={12} /> Success
                              </span>
                            ) : (
                              <span className="flex items-center gap-1" style={{ color: "var(--red-text)" }} title={row.failureReason}>
                                <XCircle size={12} /> Failed {row.failureReason ? `(${row.failureReason})` : ""}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {row.ipAddress || "—"}
                        </td>
                        <td className="px-5 py-3 text-[10px] max-w-[200px] truncate" title={row.userAgent} style={{ color: "var(--text-muted)" }}>
                          {row.userAgent || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "upload" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                      <th onClick={() => toggleSort("fileName")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">File Name <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Size</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Project</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Uploaded By</th>
                      <th onClick={() => toggleSort("createdAt")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Uploaded At <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: idx < data.length - 1 ? "1px solid var(--divider)" : "none" }}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <FileText size={14} style={{ color: "var(--blue)" }} />
                            <span className="text-xs font-semibold block truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{row.fileName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {formatBytes(row.fileSize)}
                        </td>
                        <td className="px-5 py-3 text-xs">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase"
                            style={{
                              backgroundColor: row.uploadType === "profile_image" ? "var(--green-bg)" : "var(--blue-bg)",
                              color: row.uploadType === "profile_image" ? "var(--green-text)" : "var(--blue-text)"
                            }}>
                            {row.uploadType.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {row.project?.name || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {row.uploader?.name || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-nowrap" style={{ color: "var(--text-muted)" }}>
                          {new Date(row.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <a href={row.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: "var(--blue)" }}>
                            <Download size={11} /> Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "tasks" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                      <th onClick={() => toggleSort("createdAt")} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">Time <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Task</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Updated By</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Change Log</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.id} style={{ borderBottom: idx < data.length - 1 ? "1px solid var(--divider)" : "none" }}>
                        <td className="px-5 py-3 text-xs text-nowrap" style={{ color: "var(--text-muted)" }}>
                          {new Date(row.createdAt).toLocaleString("en-IN", { hour12: true, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {row.task?.title || `ID: ${row.taskId}`}
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {row.user?.name || "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-nowrap">
                          {row.previousStatus && row.newStatus && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] px-1.5 py-px rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">{row.previousStatus}</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-[10px] px-1.5 py-px rounded font-semibold text-white bg-blue-500">{row.newStatus}</span>
                            </div>
                          )}
                          {!row.previousStatus && row.newStatus && (
                            <span className="text-[10px] px-1.5 py-px rounded font-semibold text-white bg-blue-500">Set: {row.newStatus}</span>
                          )}
                          {row.newAssigneeId && (
                            <span className="text-[9px] block text-purple-600 font-semibold mt-1">Reassigned Task</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs italic" style={{ color: "var(--text-body)" }}>
                          {row.comment ? `"${row.comment}"` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pagination controls */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--divider)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button disabled={!pagination.hasPrevPage} onClick={() => fetchData(pagination.page - 1)}
                  className="p-1.5 rounded-lg disabled:opacity-40" style={{ backgroundColor: "var(--input-bg)" }}>
                  <ChevronLeft size={14} style={{ color: "var(--text-muted)" }} />
                </button>
                <button disabled={!pagination.hasNextPage} onClick={() => fetchData(pagination.page + 1)}
                  className="p-1.5 rounded-lg disabled:opacity-40" style={{ backgroundColor: "var(--input-bg)" }}>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
