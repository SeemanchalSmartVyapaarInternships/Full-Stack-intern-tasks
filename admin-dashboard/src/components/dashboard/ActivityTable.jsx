"use client";

const statusConfig = {
  completed: { label: "Delivered",  bg: "var(--green-bg)",  color: "var(--green-text)" },
  pending:   { label: "Processing", bg: "var(--blue-bg)",   color: "var(--blue-text)" },
  failed:    { label: "Cancelled",  bg: "var(--red-bg)",    color: "var(--red-text)" },
  shipped:   { label: "Shipped",    bg: "var(--yellow-bg)", color: "var(--yellow-text)" },
};

const moduleColors = {
  Billing:     { bg: "var(--icon-purple)", color: "#7c3aed" },
  Inventory:   { bg: "var(--icon-blue)",   color: "#2563eb" },
  HR:          { bg: "var(--icon-red)",    color: "#dc2626" },
  Support:     { bg: "var(--icon-blue)",   color: "#0e7490" },
  Procurement: { bg: "var(--icon-yellow)", color: "#c2410c" },
  Analytics:   { bg: "var(--icon-green)",  color: "#16a34a" },
  Security:    { bg: "var(--icon-red)",    color: "#dc2626" },
};

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ActivityTable({ activities }) {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 60, z: -100, rotationX: -25, scale: 0.85, opacity: 0 },
      {
        y: 0,
        z: 0,
        rotationX: 0,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.5)",
        delay: 0.5,
        clearProps: "transform",
      }
    );
  }, []);

  return (
    <section
      ref={cardRef}
      id="recent-activity-section"
      className="card-3d rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
      aria-labelledby="activity-table-heading"
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--divider)" }}
      >
        <div>
          <h2 id="activity-table-heading" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Recent Activity
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Latest actions across all modules
          </p>
        </div>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "var(--blue)", backgroundColor: "var(--blue-bg)" }}
          aria-label="View all activity logs"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Recent activity table">
          <thead>
            <tr style={{ backgroundColor: "var(--table-head-bg)", borderBottom: "1px solid var(--divider)" }}>
              {["User", "Action", "Module", "Status", "Time"].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide
                    ${i === 2 ? "hidden md:table-cell" : ""}
                    ${i === 4 ? "hidden sm:table-cell" : ""}`}
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, idx) => {
              const statusCfg = statusConfig[activity.status] || statusConfig.pending;
              const moduleCfg = moduleColors[activity.module] || { bg: "var(--input-bg)", color: "var(--text-muted)" };

              return (
                <tr
                  key={activity.id}
                  className="transition-colors duration-150"
                  style={{
                    borderBottom: idx < activities.length - 1 ? "1px solid var(--divider)" : "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--table-row-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}
                      >
                        {activity.avatar}
                      </div>
                      <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {activity.user}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 max-w-[200px] truncate" style={{ color: "var(--text-body)" }}>
                    {activity.action}
                  </td>

                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: moduleCfg.bg, color: moduleCfg.color }}
                    >
                      {activity.module}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-xs whitespace-nowrap hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>
                    {activity.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
