"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { ClipboardList, CheckCircle2, ShoppingCart, Clock } from "lucide-react";

const myTasks = [
  { id: 1, title: "Process order #ORD4521",   priority: "high",   status: "pending",     due: "Today" },
  { id: 2, title: "Update delivery address",   priority: "medium", status: "in-progress", due: "Today" },
  { id: 3, title: "Call vendor for restock",   priority: "low",    status: "pending",     due: "Tomorrow" },
  { id: 4, title: "Submit daily report",       priority: "high",   status: "pending",     due: "Today" },
  { id: 5, title: "Review product catalog",    priority: "low",    status: "done",        due: "Done" },
];

const myOrders = [
  { id: "#ORD4521", product: "Wireless Headphones", amount: "₹7,499", status: "processing" },
  { id: "#ORD4398", product: "Smart Watch",         amount: "₹12,499", status: "shipped" },
  { id: "#ORD4201", product: "Phone Case",          amount: "₹499",   status: "delivered" },
];

const priorityColor = { high: "var(--red-text)", medium: "var(--yellow-text)", low: "var(--blue-text)" };
const priorityBg    = { high: "var(--red-bg)",   medium: "var(--yellow-bg)",   low: "var(--blue-bg)" };
const statusColor   = { pending: "var(--yellow-text)", "in-progress": "var(--blue-text)", done: "var(--green-text)" };

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(cardsRef.current.filter(Boolean),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "back.out(1.4)", clearProps: "transform" }
    );
  }, []);

  const stats = [
    { id: "tasks",   label: "My Tasks",       value: String(myTasks.filter(t => t.status !== "done").length), Icon: ClipboardList, bg: "var(--icon-blue)",   color: "var(--blue-text)" },
    { id: "done",    label: "Completed Today", value: String(myTasks.filter(t => t.status === "done").length), Icon: CheckCircle2, bg: "var(--icon-green)",  color: "var(--green-text)" },
    { id: "orders",  label: "My Orders",       value: String(myOrders.length),                                  Icon: ShoppingCart,  bg: "var(--icon-purple)", color: "#7c3aed" },
    { id: "pending", label: "Due Today",       value: String(myTasks.filter(t => t.due === "Today").length),    Icon: Clock,         bg: "var(--icon-yellow)", color: "var(--yellow-text)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>My Workspace</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Welcome, {user?.name}. Here&apos;s your personal overview.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: "var(--input-bg)", color: "var(--text-muted)" }}>
          Employee
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.id} ref={(el) => (cardsRef.current[i] = el)}
            className="card-3d rounded-xl p-5"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--card-shadow)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My tasks */}
        <div className="rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>My Tasks</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
            {myTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center`}
                    style={{ borderColor: t.status === "done" ? "var(--green-text)" : "var(--border-color)" }}>
                    {t.status === "done" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--green-text)" }} />}
                  </div>
                  <p className="text-xs" style={{
                    color: t.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: t.status === "done" ? "line-through" : "none"
                  }}>{t.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: priorityBg[t.priority], color: priorityColor[t.priority] }}>
                    {t.priority}
                  </span>
                  <span className="text-[10px]" style={{ color: statusColor[t.status] }}>{t.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My orders */}
        <div className="rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>My Recent Orders</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
            {myOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{o.product}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{o.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{o.amount}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{
                      backgroundColor: o.status === "delivered" ? "var(--green-bg)" : o.status === "shipped" ? "var(--blue-bg)" : "var(--yellow-bg)",
                      color: o.status === "delivered" ? "var(--green-text)" : o.status === "shipped" ? "var(--blue-text)" : "var(--yellow-text)"
                    }}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
