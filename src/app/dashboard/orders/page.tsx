import type { Metadata } from 'next';
import { ShoppingCart, Search, Filter, MoreHorizontal, Plus } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

export const metadata: Metadata = { title: 'Orders — SSC' };

const orders = [
  { id: 'ORD-4821', customer: 'Rajesh Patel',    avatar: 'RP', plan: 'Enterprise Annual', amount: '$2,999', status: 'completed'  as const, date: 'Jun 5, 2026' },
  { id: 'ORD-4820', customer: 'Sunita Verma',    avatar: 'SV', plan: 'Pro Monthly',       amount: '$49',    status: 'completed'  as const, date: 'Jun 5, 2026' },
  { id: 'ORD-4819', customer: 'Arjun Mehta',     avatar: 'AM', plan: 'Pro Monthly',       amount: '$79',    status: 'failed'     as const, date: 'Jun 5, 2026' },
  { id: 'ORD-4818', customer: 'Kavitha Reddy',   avatar: 'KR', plan: 'Enterprise Q1',    amount: '$8,997', status: 'processing' as const, date: 'Jun 5, 2026' },
  { id: 'ORD-4817', customer: 'Anjali Singh',    avatar: 'AS', plan: 'Starter Monthly',  amount: '$19',    status: 'completed'  as const, date: 'Jun 4, 2026' },
  { id: 'ORD-4816', customer: 'Deepak Nair',     avatar: 'DN', plan: 'Pro Annual',       amount: '$490',   status: 'pending'    as const, date: 'Jun 4, 2026' },
];

const statusVar = { completed: 'success', failed: 'error', processing: 'info', pending: 'warning' } as const;

export default function OrdersPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={22} className="text-red-600" /> Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} orders this week</p>
        </div>
        <button id="new-order-btn" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> New Order
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-50 transition-all">
          <Search size={14} className="text-gray-400" />
          <input id="orders-search" type="search" placeholder="Search orders..." className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
        </div>
        <button id="orders-filter-btn" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
        <table className="w-full" aria-label="Orders table">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Order ID', 'Customer', 'Plan', 'Amount', 'Status', 'Date', ''].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.id} id={`order-row-${o.id}`} className="hover:bg-gray-50 transition-colors group">
                <td className="px-5 py-4"><span className="text-xs font-mono text-red-600">{o.id}</span></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={o.avatar} size="sm" />
                    <span className="text-sm font-medium text-gray-700">{o.customer}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="text-sm text-gray-500">{o.plan}</span></td>
                <td className="px-5 py-4"><span className="text-sm font-semibold text-gray-800">{o.amount}</span></td>
                <td className="px-5 py-4"><Badge variant={statusVar[o.status]} dot>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</Badge></td>
                <td className="px-5 py-4"><span className="text-xs text-gray-500">{o.date}</span></td>
                <td className="px-5 py-4 text-right">
                  <button id={`order-menu-${o.id}`} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 ml-auto transition-all" aria-label={`Options for ${o.id}`}>
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
