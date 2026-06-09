"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TrendUpIcon, TrendDownIcon, RevenueIcon, UsersIcon, OrdersIcon, TasksIcon } from "@/components/ui/Icons";

const statIconMap = {
  revenue: RevenueIcon,
  users: UsersIcon,
  orders: OrdersIcon,
  tasks: TasksIcon,
};

const colorThemes = {
  users:   { iconBg: "var(--icon-blue)",   iconColor: "#3b82f6" },
  orders:  { iconBg: "var(--icon-yellow)", iconColor: "#ca8a04" },
  revenue: { iconBg: "var(--icon-green)",  iconColor: "#16a34a" },
  tasks:   { iconBg: "var(--icon-red)",    iconColor: "#ef4444" },
};

export default function StatsCard({ id, title, value, change, trend, icon, description }) {
  const cardRef = useRef(null);
  const Icon = statIconMap[icon] || RevenueIcon;
  const theme = colorThemes[icon] || colorThemes.users;
  const isPositive = trend === "up";

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 50, z: -50, rotationX: -20, scale: 0.85, opacity: 0 },
      {
        y: 0,
        z: 0,
        rotationX: 0,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.5)",
        delay: 0.1 * id,
        clearProps: "transform",
      }
    );
  }, [id]);

  return (
    <article
      ref={cardRef}
      id={`stats-card-${id}`}
      className="card-3d rounded-xl p-5 flex flex-col gap-3 cursor-default"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: theme.iconColor }} />
        </div>

        <span
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            backgroundColor: isPositive ? "var(--green-bg)" : "var(--red-bg)",
            color: isPositive ? "var(--green-text)" : "var(--red-text)",
          }}
        >
          {isPositive ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
          {change}
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {title}
        </p>
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
    </article>
  );
}
