"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";

const products = [
  { id: 1, name: "iPhone 15 Pro",      sku: "APL-IP15P",  category: "Electronics", price: "₹1,29,999", stock: 42,  status: "in-stock" },
  { id: 2, name: "MacBook Air M3",     sku: "APL-MBA-M3", category: "Computers",   price: "₹1,09,999", stock: 18,  status: "in-stock" },
  { id: 3, name: "Smart Watch Pro",    sku: "SAM-SWP3",   category: "Wearables",   price: "₹12,499",   stock: 7,   status: "low-stock" },
  { id: 4, name: "Wireless Earbuds",   sku: "SNY-WEB2",   category: "Audio",       price: "₹4,999",    stock: 156, status: "in-stock" },
  { id: 5, name: "Gaming Keyboard",    sku: "LGT-GKB5",   category: "Accessories", price: "₹8,999",    stock: 0,   status: "out-of-stock" },
  { id: 6, name: "USB-C Hub 7-in-1",   sku: "ACS-USB7",   category: "Accessories", price: "₹3,499",    stock: 89,  status: "in-stock" },
  { id: 7, name: "Monitor Stand Arm",  sku: "EGT-MSA1",   category: "Furniture",   price: "₹2,999",    stock: 34,  status: "in-stock" },
  { id: 8, name: "Portable SSD 1TB",   sku: "SAM-PSSD1",  category: "Storage",     price: "₹7,999",    stock: 5,   status: "low-stock" },
];

const stockBg  = { "in-stock": "var(--green-bg)", "low-stock": "var(--yellow-bg)", "out-of-stock": "var(--red-bg)" };
const stockClr = { "in-stock": "var(--green-text)", "low-stock": "var(--yellow-text)", "out-of-stock": "var(--red-text)" };
const StockIcon = { "in-stock": CheckCircle2, "low-stock": AlertTriangle, "out-of-stock": Package };

export default function ProductsPage() {
  const total = products.length;
  const inStock = products.filter(p => p.status === "in-stock").length;
  const lowStock = products.filter(p => p.status === "low-stock").length;

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Products</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{total} products in catalog</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--blue)" }}>
            <Package size={15} /> Add Product
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Products", value: total,    color: "var(--blue)" },
            { label: "In Stock",       value: inStock,  color: "var(--green-text)" },
            { label: "Low Stock",      value: lowStock, color: "var(--yellow-text)" },
          ].map(s => (
            <div key={s.label} className="card-3d rounded-xl p-4 text-center" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card-3d rounded-xl overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--divider)" }}>
                  {["Product","SKU","Category","Price","Stock","Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const SI = StockIcon[p.status];
                  return (
                    <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? "1px solid var(--divider)" : "none" }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "var(--blue-bg)" }}>
                            <Package size={14} style={{ color: "var(--blue-text)" }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{p.sku}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{p.category}</td>
                      <td className="px-5 py-3 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.price}</td>
                      <td className="px-5 py-3 text-xs font-semibold" style={{ color: p.stock === 0 ? "var(--red-text)" : "var(--text-primary)" }}>{p.stock}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full w-fit font-semibold"
                          style={{ backgroundColor: stockBg[p.status], color: stockClr[p.status] }}>
                          <SI size={11} />
                          {p.status.replace("-", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
