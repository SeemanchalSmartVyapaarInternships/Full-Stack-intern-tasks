"use client";

const actions = [
  { id: "add-user",        label: "Add User",        icon: "👤", iconBg: "var(--icon-blue)" },
  { id: "add-product",     label: "Add Product",     icon: "📦", iconBg: "var(--icon-green)" },
  { id: "add-order",       label: "Add Order",       icon: "🛒", iconBg: "var(--icon-purple)" },
  { id: "generate-report", label: "Generate Report", icon: "📊", iconBg: "var(--icon-yellow)" },
];

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function QuickActions() {
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
        delay: 0.6,
        clearProps: "transform",
      }
    );
  }, []);

  return (
    <div
      ref={cardRef}
      className="card-3d rounded-xl p-5 h-full"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Quick Actions
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        Frequently used shortcuts
      </p>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            id={`quick-action-${action.id}`}
            className="card-3d quick-action-btn flex flex-col items-center gap-2 p-4 rounded-xl"
            aria-label={action.label}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl pointer-events-none"
              style={{ backgroundColor: action.iconBg }}
            >
              {action.icon}
            </div>
            <span className="text-xs font-semibold pointer-events-none" style={{ color: "var(--text-body)" }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
