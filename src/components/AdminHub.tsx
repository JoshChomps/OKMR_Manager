
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import type { User, UserStatus, AppLogEntry, RolePermissions } from '../types';
import { 
  UserPlus, Search, Shield, Tag as TagIcon, MoreHorizontal, 
  CheckCircle2, XCircle, Users, Clock, Hash, Plus, Trash2,
  BarChart3, Activity, MessageSquare, ClipboardList, Printer,
  History, UserCheck, AlertCircle, FileText, Lock, Check, Settings2,
  Phone, HeartPulse, ShieldAlert
} from 'lucide-react';

interface AdminHubProps {
  users: User[];
  logs: AppLogEntry[];
  permissions: Record<UserRole, RolePermissions>;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onUpdatePermissions: (role: UserRole, key: keyof RolePermissions, value: boolean) => void;
}

const AdminHub: React.FC<AdminHubProps> = ({ 
  users, logs, permissions, onUpdateUser, onDeleteUser, onUpdatePermissions 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'pending' | 'safety' | 'analytics' | 'logs' | 'permissions'>('roster');
  const [globalTags, setGlobalTags] = useState(['Software', 'Electrical', 'Mechanical', 'Admin', 'Safety', 'Diver']);

  const stats = useMemo(() => {
    const approvedUsers = users.filter(u => u.status === 'approved');
    return {
      total: approvedUsers.length,
      pending: users.filter(u => u.status === 'pending').length,
      safetyVerified: approvedUsers.filter(u => u.phone && u.emergencyContactPhone).length
    };
  }, [users]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && u.status === 'pending';
    if (activeTab === 'safety') return matchesSearch && u.status === 'approved';
    if (activeTab === 'roster') return matchesSearch && u.status === 'approved';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Admin Hub</h2>
          <p className="text-slate-500 font-medium">Manage team roles, access, and member safety info.</p>
        </div>
        <div className="flex gap-2 no-print">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200"
          >
            <Printer size={16} /> Print Team Roster
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-6 bg-slate-50/50 flex flex-col gap-4 no-print">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'roster', label: 'Team Roster', icon: <Users size={16}/> },
              { id: 'pending', label: 'New Apps', icon: <UserPlus size={16}/> },
              { id: 'safety', label: 'Safety Contacts', icon: <ShieldAlert size={16}/> },
              { id: 'permissions', label: 'Role Permissions', icon: <Lock size={16}/> },
              { id: 'analytics', label: 'Stats', icon: <Activity size={16}/> },
              { id: 'logs', label: 'Audit Log', icon: <History size={16}/> },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
              >
                {tab.icon} {tab.label}
                {tab.id === 'pending' && stats.pending > 0 && <span className="ml-1 bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.pending}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="p-0 min-h-[600px]">
          {(activeTab === 'roster' || activeTab === 'pending') && (
            <div className="animate-in fade-in">
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 no-print">
                <Search className="text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Find a member..." 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-500 font-black border-b border-slate-100 bg-slate-50/30">
                    <th className="px-8 py-5">Name</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5">Tags</th>
                    <th className="px-8 py-5 text-right no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs shadow-inner">{user.name.charAt(0)}</div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm tracking-tight">{user.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <select 
                          value={user.role} 
                          onChange={(e) => onUpdateUser(user.id, { role: e.target.value as UserRole })}
                          className="text-xs font-black uppercase tracking-widest text-blue-600 bg-transparent border-none p-0 focus:ring-0"
                        >
                          {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1">
                          {user.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[8px] font-black uppercase border border-slate-200">{t}</span>)}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right no-print">
                        {activeTab === 'pending' ? (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => onUpdateUser(user.id, { status: 'approved' })} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl"><CheckCircle2 size={18}/></button>
                            <button onClick={() => onUpdateUser(user.id, { status: 'rejected' })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"><XCircle size={18}/></button>
                          </div>
                        ) : (
                          <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="animate-in fade-in">
              <div className="p-8 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-black text-rose-900 uppercase italic">Team Safety List</h3>
                   <p className="text-rose-700 text-xs font-bold uppercase mt-1">Contact info for emergencies.</p>
                </div>
                <ShieldAlert className="text-rose-400" size={32} />
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-8 py-5">Member Name</th>
                    <th className="px-8 py-5">Primary Phone</th>
                    <th className="px-8 py-5">Emergency Contact</th>
                    <th className="px-8 py-5">Emergency Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => u.status === 'approved').map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 text-sm">
                      <td className="px-8 py-4 font-bold text-slate-800">{user.name}</td>
                      <td className="px-8 py-4 font-mono text-slate-600">{user.phone || 'N/A'}</td>
                      <td className="px-8 py-4 font-medium text-slate-700">{user.emergencyContactName || 'N/A'}</td>
                      <td className="px-8 py-4 font-mono text-rose-600 font-bold">{user.emergencyContactPhone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="p-10 space-y-8 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Lock size={24}/></div>
                <h3 className="text-xl font-black uppercase italic text-slate-900">Role Permissions</h3>
              </div>
              <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <th className="px-8 py-5">Feature Access</th>
                      {Object.values(UserRole).map(role => (
                        <th key={role} className="px-8 py-5 text-center">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {[
                      { key: 'canEditKanban', label: 'Manage Tasks' },
                      { key: 'canEditCalendar', label: 'Manage Events' },
                      { key: 'canPostAnnouncements', label: 'Post Announcements' },
                      { key: 'canEditModuleContent', label: 'Edit Page Content' },
                      { key: 'canManageUsers', label: 'Manage Members' },
                      { key: 'canCreateSOP', label: 'Create SOPs' },
                    ].map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50/50">
                        <td className="px-8 py-5 text-sm">{row.label}</td>
                        {Object.values(UserRole).map(role => (
                          <td key={role} className="px-8 py-5 text-center">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500" 
                              checked={permissions[role][row.key as keyof RolePermissions]}
                              onChange={(e) => onUpdatePermissions(role, row.key as keyof RolePermissions, e.target.checked)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-10 flex flex-col items-center justify-center text-slate-300">
               <Activity size={64} className="mb-4 opacity-20" />
               <p className="font-black uppercase tracking-widest text-xs">Loading data...</p>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="animate-in fade-in h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] uppercase font-black text-slate-400">
                  <tr>
                    <th className="px-8 py-5">Time</th>
                    <th className="px-8 py-5">Member</th>
                    <th className="px-8 py-5">Action</th>
                    <th className="px-8 py-5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...logs].reverse().map(log => (
                    <tr key={log.id} className="text-xs hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-8 py-4 font-bold text-slate-900">{log.userName}</td>
                      <td className="px-8 py-4"><span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-black uppercase text-[8px]">{log.type}</span></td>
                      <td className="px-8 py-4 text-slate-500 font-medium">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHub;
