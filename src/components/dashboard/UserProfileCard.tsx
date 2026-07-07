'use client';

import React from 'react';
import { Briefcase, CheckSquare, Mail, Calendar, Shield, Edit3, MapPin, ExternalLink, Star } from 'lucide-react';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { currentUser, teamMembers } from '@/data/mock';

const roleConfig = {
  admin:  { label: 'Admin',  variant: 'primary' as const, icon: Shield },
  editor: { label: 'Editor', variant: 'info'    as const, icon: Edit3  },
  viewer: { label: 'Viewer', variant: 'ghost'   as const, icon: Star   },
};

export default function UserProfileCard() {
  const role     = roleConfig[currentUser.role];
  const RoleIcon = role.icon;

  return (
    <div id="user-profile-card" className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
      {/* Cover banner — red gradient */}
      <div className="h-20 bg-gradient-to-r from-red-600 via-red-500 to-rose-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDQydjQySDE4YzkuOTQgMCAxOC04LjA2IDE4LTE4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      </div>

      <div className="px-4 pb-4">
        {/* Avatar overlapping banner */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <div className="ring-4 ring-white rounded-full shadow-sm">
            <Avatar initials={currentUser.avatar} size="xl" online />
          </div>
          <button id="edit-profile-btn" className="mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200 transition-all">
            <Edit3 size={11} /> Edit
          </button>
        </div>

        {/* Name + role */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-bold text-gray-900">{currentUser.name}</h3>
            <Badge variant={role.variant} dot>
              <RoleIcon size={9} />
              {role.label}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">{currentUser.email}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <MapPin size={10} /> San Francisco, CA
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Briefcase,   label: 'Projects', value: currentUser.projects },
            { icon: CheckSquare, label: 'Tasks',    value: currentUser.tasks    },
            { icon: Star,        label: 'Rating',   value: '4.9'                },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center hover:bg-red-50 hover:border-red-100 transition-colors">
              <Icon size={14} className="text-gray-400 mx-auto mb-1" />
              <p className="text-base font-bold text-gray-800 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button id="profile-message-btn"  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all shadow-sm">
            <Mail size={13} /> Message
          </button>
          <button id="profile-schedule-btn" className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 border border-gray-200 transition-all">
            <Calendar size={13} /> Schedule
          </button>
        </div>

        {/* Team section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team</p>
            <button className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors">
              View all <ExternalLink size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {teamMembers.map((member) => {
              const mRole = roleConfig[member.role];
              return (
                <div key={member.id} id={`team-member-${member.id}`} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <Avatar initials={member.avatar} size="sm" online={member.status === 'active'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{member.name}</p>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                  <Badge variant={mRole.variant} size="sm">{mRole.label}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
