import type { Metadata } from 'next';
import { Package, Plus, Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Products — SSC' };

const products = [
  { id: 'prod_001', name: 'Starter Plan',      price: '$19/mo',  users: 8420, revenue: '$159,980', growth: '+12%', status: 'active'   as const },
  { id: 'prod_002', name: 'Pro Plan',          price: '$49/mo',  users: 3150, revenue: '$154,350', growth: '+8%',  status: 'active'   as const },
  { id: 'prod_003', name: 'Enterprise Plan',   price: '$299/mo', users: 420,  revenue: '$125,580', growth: '+24%', status: 'active'   as const },
  { id: 'prod_004', name: 'Add-on: API Access',price: '$29/mo',  users: 1820, revenue: '$52,780',  growth: '+5%',  status: 'active'   as const },
  { id: 'prod_005', name: 'Add-on: Analytics+',price: '$19/mo', users: 940,  revenue: '$17,860',  growth: '-2%',  status: 'inactive' as const },
];

export default function ProductsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={22} className="text-red-600" /> Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your pricing plans and add-ons.</p>
        </div>
        <button id="add-product-btn" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-white border border-gray-200 rounded-xl w-full sm:w-80 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-50 transition-all">
        <Search size={14} className="text-gray-400" />
        <input id="products-search" type="search" placeholder="Search products..." className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} id={`product-card-${p.id}`} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-red-100 hover:scale-[1.01] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Package size={18} className="text-red-600" />
              </div>
              <Badge variant={p.status === 'active' ? 'success' : 'ghost'} dot>
                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">{p.name}</h3>
            <p className="text-2xl font-bold text-red-600 mb-4">{p.price}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 border border-gray-100 rounded-xl py-2">
                <p className="text-xs text-gray-500 mb-0.5">Users</p>
                <p className="text-sm font-bold text-gray-800">{p.users.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl py-2">
                <p className="text-xs text-gray-500 mb-0.5">Revenue</p>
                <p className="text-sm font-bold text-gray-800">{p.revenue}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl py-2">
                <p className="text-xs text-gray-500 mb-0.5">Growth</p>
                <p className={`text-sm font-bold ${p.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{p.growth}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
