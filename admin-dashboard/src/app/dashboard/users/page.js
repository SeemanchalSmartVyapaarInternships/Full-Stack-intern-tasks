"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { Search, UserPlus, Trash2, Edit, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const roleBg   = { admin: "var(--blue-bg)",   manager: "var(--green-bg)",   employee: "var(--input-bg)" };
const roleColor = { admin: "var(--blue-text)", manager: "var(--green-text)", employee: "var(--text-muted)" };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch("/users/all");
        setUsers(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    setError("");
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>User Management</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{users.length} registered users</p>
          </div>
        </div>

        <div className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <div className="relative max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..." suppressHydrationWarning
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-sm" style={{ color: "var(--red-text)" }}>{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                    {["User","Email","Role","Joined"].map(h => (
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
                        <select
                          value={u.role}
                          disabled={u.id === currentUser?.id || updatingId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize focus:outline-none border border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          style={{
                            backgroundColor: roleBg[u.role],
                            color: roleColor[u.role],
                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundPosition: 'right 0.15rem center',
                            backgroundSize: '0.8rem 0.8rem',
                            backgroundRepeat: 'no-repeat',
                            paddingRight: '1rem'
                          }}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
