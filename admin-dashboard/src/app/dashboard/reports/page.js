"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { FileText, Download } from "lucide-react";

const reports = [
  { id: "RPT-001", name: "Monthly Revenue Report",    period: "Jun 2026",   type: "Financial", status: "ready",      size: "2.4 MB" },
  { id: "RPT-002", name: "User Growth Analysis",       period: "Q2 2026",    type: "Users",     status: "ready",      size: "1.1 MB" },
  { id: "RPT-003", name: "Order Fulfillment Summary",  period: "Jun 2026",   type: "Orders",    status: "ready",      size: "3.2 MB" },
  { id: "RPT-004", name: "Product Performance Report", period: "Jun 2026",   type: "Products",  status: "generating", size: "—" },
  { id: "RPT-005", name: "Team Productivity Report",   period: "Q2 2026",    type: "Team",      status: "ready",      size: "890 KB" },
  { id: "RPT-006", name: "Customer Retention Analysis",period: "H1 2026",    type: "Users",     status: "ready",      size: "1.8 MB" },
];

const typeBg  = { Financial: "var(--blue-bg)", Users: "var(--green-bg)", Orders: "var(--yellow-bg)", Products: "var(--icon-purple)", Team: "var(--icon-blue)" };
const typeClr = { Financial: "var(--blue-text)", Users: "var(--green-text)", Orders: "var(--yellow-text)", Products: "#7c3aed", Team: "var(--blue-text)" };

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Reports</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Download and manage business reports</p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  {["Report","Period","Type","Size","Status","Action"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < reports.length - 1 ? "1px solid var(--divider)" : "none" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "var(--blue-bg)" }}>
                          <FileText size={14} style={{ color: "var(--blue-text)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.period}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: typeBg[r.type], color: typeClr[r.type] }}>{r.type}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{r.size}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.status === "generating" ? "animate-pulse" : ""}`}
                        style={{
                          backgroundColor: r.status === "ready" ? "var(--green-bg)" : "var(--yellow-bg)",
                          color: r.status === "ready" ? "var(--green-text)" : "var(--yellow-text)"
                        }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button disabled={r.status !== "ready"}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "var(--blue-bg)", color: "var(--blue-text)" }}>
                        <Download size={12} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
