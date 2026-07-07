import type { Metadata } from 'next';
import { FileText, Plus, Search, Eye, Edit3, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

export const metadata: Metadata = { title: 'Content — SSC' };

const posts = [
  { id: 'post_001', title: 'Product Update v3.2 — New Features',    author: 'Anjali Singh',   avatar: 'AS', status: 'published' as const, views: 4820,  date: 'Jun 5, 2026'  },
  { id: 'post_002', title: 'Getting Started with SSC API',           author: 'Vikash Kumar',   avatar: 'VK', status: 'published' as const, views: 12400, date: 'Jun 3, 2026'  },
  { id: 'post_003', title: 'Q2 Platform Performance Report',         author: 'Rahul Singh',    avatar: 'RS', status: 'draft'     as const, views: 0,     date: 'Jun 6, 2026'  },
  { id: 'post_004', title: 'Enterprise Security Best Practices',     author: 'Priya Sharma',   avatar: 'PS', status: 'review'    as const, views: 0,     date: 'Jun 4, 2026'  },
  { id: 'post_005', title: 'How to Optimize Your Dashboard',         author: 'Anjali Singh',   avatar: 'AS', status: 'published' as const, views: 7130,  date: 'May 28, 2026' },
];

const statusVar = { published: 'success', draft: 'ghost', review: 'warning' } as const;

export default function ContentPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={22} className="text-red-600" /> Content
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage blog posts, docs, and announcements.</p>
        </div>
        <button id="new-post-btn" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
          <Plus size={15} /> New Post
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-white border border-gray-200 rounded-xl w-full sm:w-96 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-50 transition-all">
        <Search size={14} className="text-gray-400" />
        <input id="content-search" type="search" placeholder="Search content..." className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
        <table className="w-full" aria-label="Content table">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Title', 'Author', 'Status', 'Views', 'Date', ''].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((p) => (
              <tr key={p.id} id={`content-row-${p.id}`} className="hover:bg-gray-50 transition-colors group">
                <td className="px-5 py-4"><p className="text-sm font-medium text-gray-800 max-w-xs truncate">{p.title}</p></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar initials={p.avatar} size="xs" />
                    <span className="text-xs text-gray-600">{p.author}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><Badge variant={statusVar[p.status]} dot>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</Badge></td>
                <td className="px-5 py-4">
                  {p.views > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-gray-700"><Eye size={12} className="text-gray-400" />{p.views.toLocaleString()}</span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-5 py-4"><span className="text-xs text-gray-500">{p.date}</span></td>
                <td className="px-5 py-4 text-right">
                  <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 transition-opacity">
                    <button id={`content-edit-${p.id}`}   className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"  aria-label={`Edit ${p.title}`}>  <Edit3  size={12} /></button>
                    <button id={`content-delete-${p.id}`} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors" aria-label={`Delete ${p.title}`}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
