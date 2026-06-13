import type { Metadata } from 'next';
import { Users, UserPlus, Search, Filter, MoreHorizontal, Shield, Edit3 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { teamMembers, currentUser } from '@/data/mock';
import type { User } from '@/types';

export const metadata: Metadata = { title: 'Users — SSC' };

const allUsers: User[] = [currentUser, ...teamMembers];

const statusVariant = { active: 'success' as const, inactive: 'ghost' as const, pending: 'warning' as const };
const roleVariant   = { admin: 'primary' as const, editor: 'info' as const, viewer: 'ghost' as const };

export default function UsersPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-red-600" /> Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">{allUsers.length} team members · Admin access required</p>
        </div>
        <button id="invite-user-btn" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-50 transition-all">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input id="users-search-input" type="search" placeholder="Search users by name or email..." className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
        </div>
        <button id="users-filter-btn" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors">
          <Filter size={14} /> Filters
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
        <table className="w-full" aria-label="Team members table">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Member', 'Role', 'Status', 'Projects', 'Joined', ''].map((h) => (
                <th key={h} className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Role' ? 'hidden md:table-cell' : ''} ${h === 'Projects' || h === 'Joined' ? 'hidden lg:table-cell' : ''} ${h === '' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allUsers.map((user) => (
              <tr key={user.id} id={`user-row-${user.id}`} className="hover:bg-gray-50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={user.avatar} size="md" online={user.status === 'active'} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 hidden md:table-cell">
                  <Badge variant={roleVariant[user.role]} dot>
                    {user.role === 'admin' && <Shield size={9} />}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </td>
                <td className="px-3 py-4"><Badge variant={statusVariant[user.status]} dot>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</Badge></td>
                <td className="px-3 py-4 hidden lg:table-cell"><span className="text-sm text-gray-700">{user.projects}</span></td>
                <td className="px-3 py-4 hidden lg:table-cell"><span className="text-xs text-gray-500">{new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                <td className="px-5 py-4 text-right">
                  <button id={`user-menu-${user.id}`} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 ml-auto transition-all" aria-label={`Options for ${user.name}`}>
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <span className="text-xs text-gray-500">Role permissions:</span>
        <Badge variant="primary" dot><Shield size={9} /> Admin — Full access</Badge>
        <Badge variant="info"    dot><Edit3  size={9} /> Editor — Content &amp; data</Badge>
        <Badge variant="ghost"   dot>Viewer — Read only</Badge>
      </div>
    </div>
  );
}
