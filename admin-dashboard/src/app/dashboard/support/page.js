"use client";
import { useState } from "react";
import { HelpCircle, Search, ChevronDown, ChevronUp, Plus } from "lucide-react";

const tickets = [
  { id: "TKT-001", subject: "Order not delivered after 5 days",         priority: "high",   status: "open",         date: "Jun 19" },
  { id: "TKT-002", subject: "Wrong item shipped in order #ORD4102",      priority: "high",   status: "in-progress",  date: "Jun 18" },
  { id: "TKT-003", subject: "Payment deducted but order not placed",     priority: "medium", status: "resolved",     date: "Jun 17" },
  { id: "TKT-004", subject: "Product return request",                    priority: "low",    status: "open",         date: "Jun 17" },
  { id: "TKT-005", subject: "Cannot update delivery address",            priority: "medium", status: "resolved",     date: "Jun 16" },
];

const faqs = [
  { q: "How do I track my order?",         a: "Go to Orders → select your order → the status column shows real-time updates." },
  { q: "How long does delivery take?",     a: "Standard delivery: 3–5 business days. Express available for select pincodes." },
  { q: "How do I raise a return request?", a: "Go to Orders → select the item → click Return/Exchange within 7 days of delivery." },
  { q: "How do I change my display name?", a: "Go to Settings → update your Display Name field → click Save Changes." },
  { q: "How do I contact my manager?",     a: "Go to Team → find your manager → use the contact details listed on their card." },
];

const priorityBg  = { high: "var(--red-bg)",    medium: "var(--yellow-bg)", low: "var(--blue-bg)" };
const priorityClr = { high: "var(--red-text)",  medium: "var(--yellow-text)", low: "var(--blue-text)" };
const statusBg    = { open: "var(--yellow-bg)", "in-progress": "var(--blue-bg)", resolved: "var(--green-bg)" };
const statusClr   = { open: "var(--yellow-text)", "in-progress": "var(--blue-text)", resolved: "var(--green-text)" };

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Support</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Raise tickets and get help fast</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--blue)" }}>
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open",       value: tickets.filter(t => t.status === "open").length,        color: "var(--yellow-text)", bg: "var(--yellow-bg)" },
          { label: "In Progress",value: tickets.filter(t => t.status === "in-progress").length, color: "var(--blue-text)",   bg: "var(--blue-bg)" },
          { label: "Resolved",   value: tickets.filter(t => t.status === "resolved").length,    color: "var(--green-text)",  bg: "var(--green-bg)" },
        ].map(s => (
          <div key={s.label} className="card-3d rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: s.bg, color: s.color }}>{s.value}</div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tickets list */}
      <div className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>My Tickets</h3>
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets..."
              suppressHydrationWarning
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)" }} />
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
          {filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t.subject}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{t.id} · {t.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize"
                  style={{ backgroundColor: priorityBg[t.priority], color: priorityClr[t.priority] }}>
                  {t.priority}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: statusBg[t.status], color: statusClr[t.status] }}>
                  {t.status.replace("-", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ accordion */}
      <div className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h3>
        </div>
        {faqs.map((f, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid var(--divider)" : "none" }}>
            <button className="w-full flex items-center justify-between px-5 py-3.5 text-left"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span className="text-xs font-semibold pr-4" style={{ color: "var(--text-primary)" }}>{f.q}</span>
              {openFaq === i
                ? <ChevronUp size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                : <ChevronDown size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />}
            </button>
            {openFaq === i && (
              <p className="px-5 pb-4 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
