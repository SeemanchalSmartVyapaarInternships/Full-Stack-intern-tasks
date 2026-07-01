"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { Mail, Loader2, Building2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const roleBg   = { admin: "var(--blue-bg)",   manager: "var(--green-bg)",   employee: "var(--input-bg)" };
const roleColor = { admin: "var(--blue-text)", manager: "var(--green-text)", employee: "var(--text-muted)" };

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [teamData, deptData] = await Promise.all([
          apiFetch("/users/team"),
          apiFetch("/departments?limit=50"),
        ]);
        setTeam(teamData.data || []);
        setDepartments(deptData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTeam = team.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !deptFilter || m.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Team & Departments</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Showing {filteredTeam.length} of {team.length} team members across {departments.length} departments
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 card-3d rounded-xl"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search team members by name or email..." suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text-muted)" }}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-sm" style={{ color: "var(--red-text)" }}>{error}</div>
        ) : (
          <>
            {/* Department cards */}
            {departments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {departments.map((d) => (
                  <div key={d.id} className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "var(--blue-bg)" }}>
                        <Building2 size={18} style={{ color: "var(--blue-text)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.name}</p>
                        {d.description && (
                          <p className="text-[10px] truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>{d.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {d.members?.length || 0} member{d.members?.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                        style={{
                          backgroundColor: d.status === "active" ? "var(--green-bg)" : "var(--red-bg)",
                          color: d.status === "active" ? "var(--green-text)" : "var(--red-text)",
                        }}>{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Team member cards */}
            <h2 className="text-sm font-semibold pt-2" style={{ color: "var(--text-primary)" }}>Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTeam.map((m) => (
                <div key={m.id} className="card-3d rounded-xl p-5" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: "var(--blue)" }}>{m.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.department?.name || "No department"}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                      style={{ backgroundColor: roleBg[m.role], color: roleColor[m.role] }}>{m.role}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
                    <Mail size={12} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.email}</span>
                  </div>
                </div>
              ))}
              {filteredTeam.length === 0 && (
                <div className="col-span-full text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>No team members found.</div>
              )}
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
