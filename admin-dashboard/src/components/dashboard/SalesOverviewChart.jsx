"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const weekData = [22, 35, 28, 42, 38, 50, 45];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxVal = Math.max(...weekData);

export default function SalesOverviewChart() {
  const [hovered, setHovered] = useState(null);
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
        delay: 0.2,
        clearProps: "transform",
      }
    );
  }, []);

  const points = weekData.map((v, i) => ({
    x: 30 + i * (340 / 6),
    y: 120 - (v / maxVal) * 80,
    v,
  }));

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1].x} 125 L ${points[0].x} 125 Z`;

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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Sales Overview
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Weekly performance
          </p>
        </div>
        <select
          className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
          style={{
            border: "1px solid var(--input-border)",
            color: "var(--text-body)",
            backgroundColor: "var(--input-bg)",
            outline: "none",
          }}
          aria-label="Chart time range"
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Sales</p>
          <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>₹ 32,450</p>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "var(--green-bg)", color: "var(--green-text)" }}
        >
          ↑ 12.5%
        </span>
      </div>

      <svg viewBox="0 28 400 110" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 4} fill="#2563eb" stroke="#ffffff" strokeWidth="2" style={{ transition: "r 0.15s ease" }} />
            {hovered === i && (
              <>
                <rect x={p.x - 30} y={p.y - 26} width="60" height="20" rx="4" fill="#1e293b" />
                <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="600">
                  ₹{p.v}K · {days[i]}
                </text>
              </>
            )}
          </g>
        ))}

        {days.map((d, i) => (
          <text
            key={d}
            x={30 + i * (340 / 6)}
            y={132}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="9"
          >
            {d}
          </text>
        ))}
      </svg>
    </div>
  );
}
