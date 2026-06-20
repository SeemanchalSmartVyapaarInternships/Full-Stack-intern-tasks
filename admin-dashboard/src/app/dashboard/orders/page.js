"use client";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

const orders = [
  { id: "#ORD4521", customer: "Rahul Sharma",  product: "iPhone 15 Pro",      amount: "₹1,29,999", status: "completed", date: "Jun 19" },
  { id: "#ORD4398", customer: "Priya Singh",   product: "MacBook Air M3",     amount: "₹1,09,999", status: "shipped",   date: "Jun 18" },
  { id: "#ORD4201", customer: "Amit Verma",    product: "Smart Watch",        amount: "₹12,499",   status: "processing",date: "Jun 18" },
  { id: "#ORD4189", customer: "Neha Gupta",    product: "Wireless Earbuds",   amount: "₹4,999",    status: "pending",   date: "Jun 17" },
  { id: "#ORD4102", customer: "Kiran Patel",   product: "Gaming Keyboard",    amount: "₹8,999",    status: "completed", date: "Jun 17" },
  { id: "#ORD3988", customer: "Deepak Joshi",  product: "USB-C Hub",          amount: "₹3,499",    status: "cancelled", date: "Jun 16" },
  { id: "#ORD3901", customer: "Sonal Mehta",   product: "Monitor Stand",      amount: "₹2,999",    status: "shipped",   date: "Jun 15" },
];

const statusBg  = { completed: "var(--green-bg)", shipped: "var(--blue-bg)", processing: "var(--yellow-bg)", pending: "var(--input-bg)", cancelled: "var(--red-bg)" };
const statusClr = { completed: "var(--green-text)", shipped: "var(--blue-text)", processing: "var(--yellow-text)", pending: "var(--text-muted)", cancelled: "var(--red-text)" };

const allStatuses = ["all", "completed", "shipped", "processing", "pending", "cancelled"];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter(o =>
    (filter === "all" || o.status === filter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) ||
     o.customer.toLowerCase().includes(search.toLowerCase()) ||
     o.product.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Orders</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{filtered.length} orders shown</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allStatuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={filter === s
                  ? { backgroundColor: "var(--blue)", color: "#fff" }
                  : { backgroundColor: "var(--input-bg)", color: "var(--text-muted)" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                {["Order ID","Customer","Product","Amount","Status","Date"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--divider)" : "none" }}>
                  <td className="px-5 py-3 text-xs font-bold" style={{ color: "var(--blue-text)" }}>{o.id}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-primary)" }}>{o.customer}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{o.product}</td>
                  <td className="px-5 py-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{o.amount}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                      style={{ backgroundColor: statusBg[o.status], color: statusClr[o.status] }}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
