"use client";

const feedItems = [
  { id: 1, icon: "👤", iconBg: "var(--icon-blue)",   title: "New user registered",       sub: "John Doe",              time: "2 min ago" },
  { id: 2, icon: "📦", iconBg: "var(--icon-green)",  title: "Order #ORD1234 placed",     sub: null,                    time: "12 min ago" },
  { id: 3, icon: "💰", iconBg: "var(--icon-yellow)", title: "Payment received",           sub: "₹ 2,450 · Completed",   time: "25 min ago" },
  { id: 4, icon: "🔄", iconBg: "var(--icon-purple)", title: "Product updated",            sub: "Wireless Headphones",   time: "1 hr ago" },
  { id: 5, icon: "⭐", iconBg: "var(--icon-yellow)", title: "New review received",        sub: "★★★★★",                 time: "2 hr ago" },
];

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function RecentActivityFeed() {
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
        delay: 0.4,
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
        Recent Activity
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
        Latest updates
      </p>

      <div className="space-y-4">
        {feedItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: item.iconBg }}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </p>
              {item.sub && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {item.sub}
                </p>
              )}
            </div>
            <span className="text-[10px] whitespace-nowrap mt-0.5" style={{ color: "var(--text-muted)" }}>
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
