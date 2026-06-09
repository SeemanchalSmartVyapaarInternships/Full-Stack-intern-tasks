"use client";

const categories = [
  { label: "Electronics", percent: 35, color: "#2563eb" },
  { label: "Fashion",     percent: 25, color: "#7c3aed" },
  { label: "Books",       percent: 15, color: "#0e7490" },
  { label: "Home & Kitchen", percent: 15, color: "#ca8a04" },
  { label: "Others",     percent: 10, color: "#64748b" },
];

function buildSlices(slices, cx, cy, r) {
  let cumulative = 0;
  return slices.map((slice) => {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += slice.percent;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return {
      ...slice,
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${slice.percent > 50 ? 1 : 0} 1 ${x2} ${y2} Z`,
    };
  });
}

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CategoryDistribution() {
  const slices = buildSlices(categories, 80, 80, 65);
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
        delay: 0.3,
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
        Category Distribution
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        Sales by category
      </p>

      <div className="flex flex-col items-center gap-4">
        <svg viewBox="0 0 160 160" className="w-36 h-36" aria-label="Category donut chart">
          {slices.map((s) => (
            <path
              key={s.label}
              d={s.d}
              fill={s.color}
              stroke="var(--card-bg)"
              strokeWidth="2.5"
              style={{ transition: "opacity 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            />
          ))}
          <circle cx="80" cy="80" r="38" fill="var(--card-bg)" />
          <text x="80" y="76" textAnchor="middle" fontSize="9" fill="var(--text-muted)">Total</text>
          <text x="80" y="90" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-primary)">Sales</text>
        </svg>

        <div className="w-full space-y-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs" style={{ color: "var(--text-body)" }}>{cat.label}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {cat.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
