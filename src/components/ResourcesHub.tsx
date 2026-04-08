
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import type { User, ResourceLink, CampusResource, SchoolContact } from '../types';
import { 
  Users, ExternalLink, HardDrive, MessageCircle, Github, 
  Cpu, Box, Map, BookOpen, Calendar, Phone, Mail, 
  Search, Filter, Globe, GraduationCap, Building2, 
  Wrench, Copy, Check, MessageSquare, Shield, ChevronRight,
  Plus, Trash2, Edit3, X, Save
} from 'lucide-react';

interface ResourcesHubProps {
  users: User[];
  resourceLinks: ResourceLink[];
  campusResources: CampusResource[];
  schoolContacts: SchoolContact[];
  userRole: UserRole;
  onUpdateLinks: (links: ResourceLink[]) => void;
  onUpdateCampus: (resources: CampusResource[]) => void;
  onUpdateSchool: (contacts: SchoolContact[]) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error' | 'warning') => void;
}

const COLOR_OPTIONS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-slate-800', 'bg-rose-600', 
  'bg-amber-600', 'bg-cyan-500', 'bg-emerald-600', 'bg-purple-600'
];

const ResourcesHub: React.FC<ResourcesHubProps> = ({ 
  users, resourceLinks, campusResources, schoolContacts, userRole,
  onUpdateLinks, onUpdateCampus, onUpdateSchool, onNotify 
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'tools' | 'campus'>('directory');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [modalType, setModalType] = useState<'link' | 'campus' | 'contact' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const isExec = userRole === UserRole.EXECUTIVE;

  const allTags = useMemo(() => {
    const tags = new Set<string>(['All']);
    users.forEach(u => u.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [users]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         u.role.toLowerCase().includes(search.toLowerCase());
    const matchesTag = tagFilter === 'All' || u.tags.includes(tagFilter);
    return matchesSearch && matchesTag && u.status === 'approved';
  });

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    onNotify('Email copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const id = editingItem?.id || Math.random().toString(36).substr(2, 9);

    if (modalType === 'link') {
      const newItem: ResourceLink = {
        id,
        label: fd.get('label') as string,
        url: fd.get('url') as string,
        desc: fd.get('desc') as string,
        color: fd.get('color') as string,
      };
      if (editingItem) {
        onUpdateLinks(resourceLinks.map(l => l.id === id ? newItem : l));
      } else {
        onUpdateLinks([...resourceLinks, newItem]);
      }
    } else if (modalType === 'campus') {
      const newItem: CampusResource = {
        id,
        title: fd.get('title') as string,
        contact: fd.get('contact') as string,
        loc: fd.get('loc') as string,
        desc: fd.get('desc') as string,
      };
      if (editingItem) {
        onUpdateCampus(campusResources.map(c => c.id === id ? newItem : c));
      } else {
        onUpdateCampus([...campusResources, newItem]);
      }
    } else if (modalType === 'contact') {
      const newItem: SchoolContact = {
        id,
        name: fd.get('name') as string,
        role: fd.get('role') as string,
        email: fd.get('email') as string,
        dept: fd.get('dept') as string,
      };
      if (editingItem) {
        onUpdateSchool(schoolContacts.map(s => s.id === id ? newItem : s));
      } else {
        onUpdateSchool([...schoolContacts, newItem]);
      }
    }

    onNotify('Resource updated successfully', 'success');
    closeModal();
  };

  const removeItem = (type: 'link' | 'campus' | 'contact', id: string) => {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    if (type === 'link') onUpdateLinks(resourceLinks.filter(l => l.id !== id));
    if (type === 'campus') onUpdateCampus(campusResources.filter(c => c.id !== id));
    if (type === 'contact') onUpdateSchool(schoolContacts.filter(s => s.id !== id));
    onNotify('Resource removed', 'info');
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
  };

  const renderModal = () => {
    if (!modalType) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">
              {editingItem ? 'Edit' : 'Add'} {modalType === 'link' ? 'Mission Tool' : modalType === 'campus' ? 'Campus Resource' : 'School Contact'}
            </h3>
            <button onClick={closeModal} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
          </div>
          <form className="space-y-6" onSubmit={handleSaveItem}>
            {modalType === 'link' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Tool Label</label>
                  <input name="label" required defaultValue={editingItem?.label} placeholder="e.g. GitHub" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Destination URL</label>
                  <input name="url" required defaultValue={editingItem?.url} placeholder="https://..." className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Brief Description</label>
                  <textarea name="desc" defaultValue={editingItem?.desc} className="w-full h-24 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Accent Color</label>
                  <select name="color" defaultValue={editingItem?.color || 'bg-blue-500'} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white transition-all">
                    {COLOR_OPTIONS.map(c => <option key={c} value={c} className="dark:bg-slate-900">{c.replace('bg-', '')}</option>)}
                  </select>
                </div>
              </>
            )}

            {modalType === 'campus' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Facility Name</label>
                  <input name="title" required defaultValue={editingItem?.title} placeholder="e.g. Makerspace" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Contact Email/Phone</label>
                    <input name="contact" defaultValue={editingItem?.contact} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Location</label>
                    <input name="loc" defaultValue={editingItem?.loc} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Service Detail</label>
                  <textarea name="desc" defaultValue={editingItem?.desc} className="w-full h-24 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white transition-all" />
                </div>
              </>
            )}

            {modalType === 'contact' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                  <input name="name" required defaultValue={editingItem?.name} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Role/Title</label>
                    <input name="role" defaultValue={editingItem?.role} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Department</label>
                    <input name="dept" defaultValue={editingItem?.dept} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">UBC Email</label>
                  <input name="email" type="email" required defaultValue={editingItem?.email} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white transition-all" />
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
              <Save size={18} /> {editingItem ? 'Save Changes' : 'Add to Hub'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const getIconForLink = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('drive')) return <HardDrive size={24} />;
    if (l.includes('discord') || l.includes('slack')) return <MessageCircle size={24} />;
    if (l.includes('github') || l.includes('gitlab')) return <Github size={24} />;
    if (l.includes('solidworks') || l.includes('cad')) return <Box size={24} />;
    if (l.includes('altium') || l.includes('cpu') || l.includes('pcb')) return <Cpu size={24} />;
    return <Globe size={24} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {renderModal()}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic transition-colors">RESOURCES HUB</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">The tactical directory, mission tools, and campus support network.</p>
        </div>
        
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit transition-colors">
          {[
            { id: 'directory', label: 'Directory', icon: <Users size={16} /> },
            { id: 'tools', label: 'Mission Tools', icon: <Wrench size={16} /> },
            { id: 'campus', label: 'Campus Support', icon: <GraduationCap size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search command personnel by name or role..."
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors" size={18} />
              <select 
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none font-bold text-sm dark:text-white transition-all cursor-pointer"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                {allTags.map(t => <option key={t} value={t} className="dark:bg-slate-900">{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 dark:bg-blue-900/10 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <div className="flex items-start gap-4 mb-6 relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate transition-colors">{user.name}</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${user.role === UserRole.EXECUTIVE ? 'text-rose-500' : 'text-blue-500'}`}>
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 relative">
                  <div className="flex flex-wrap gap-1">
                    {user.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Contact Channel</span>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px] transition-colors">{user.email}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopy(user.email, user.id)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all"
                        title="Copy Email"
                      >
                        {copiedId === user.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <a 
                        href={`mailto:${user.email}`}
                        className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all font-bold"
                        title="Direct Message"
                      >
                        <MessageSquare size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center transition-colors">
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Digital Command Center</h3>
             {isExec && (
               <button 
                onClick={() => setModalType('link')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all"
               >
                 <Plus size={16} /> Add Tool
               </button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resourceLinks.map(link => (
              <div key={link.id} className="relative group">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center hover:border-blue-500 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-2 transition-all h-full"
                >
                  <div className={`${link.color} text-white p-5 rounded-3xl mb-6 shadow-xl shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
                    {getIconForLink(link.label)}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-2 tracking-tight transition-colors">{link.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 transition-colors">{link.desc}</p>
                  <div className="mt-auto flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest transition-colors">
                    Launch Tool <ExternalLink size={14} />
                  </div>
                </a>
                {isExec && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.preventDefault(); setModalType('link'); setEditingItem(link); }} className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow rounded-full text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"><Edit3 size={14}/></button>
                    <button onClick={(e) => { e.preventDefault(); removeItem('link', link.id); }} className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow rounded-full text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all"><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'campus' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center transition-colors">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3 transition-colors">
                    <Building2 className="text-blue-600 dark:text-blue-400" size={24} /> Strategic Facilities
                 </h3>
                 {isExec && (
                    <button 
                      onClick={() => setModalType('campus')}
                      className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all"
                    >
                      <Plus size={18} />
                    </button>
                 )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {campusResources.map((res) => (
                  <div key={res.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex items-start gap-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all relative group transition-colors">
                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-3 rounded-2xl transition-colors">
                      {res.title.toLowerCase().includes('shop') || res.title.toLowerCase().includes('maker') ? <Wrench size={18} /> : <Shield size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white transition-colors">{res.title}</h4>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg transition-colors">{res.loc}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 transition-colors">{res.desc}</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors">
                        <Mail size={12} /> {res.contact}
                      </div>
                    </div>
                    {isExec && (
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setModalType('campus'); setEditingItem(res); }} className="text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit3 size={14}/></button>
                         <button onClick={() => removeItem('campus', res.id)} className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3 transition-colors">
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} /> Space Bookings
              </h3>
              <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full min-h-[400px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative">
                  <h4 className="text-2xl font-black uppercase italic mb-4">Strategic Planning Rooms</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Need a space for a team sync or design review? Access the UBCO room booking portal to reserve breakout rooms in EME or the Library.
                  </p>
                  <div className="space-y-4">
                    <a 
                      href="https://rooms.ok.ubc.ca" 
                      target="_blank"
                      className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={20} className="text-blue-400" />
                        <span className="font-bold text-sm">EME Breakout Rooms</span>
                      </div>
                      <ChevronRight size={18} />
                    </a>
                    <a 
                      href="https://libcal.ok.ubc.ca" 
                      target="_blank"
                      className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-emerald-400" />
                        <span className="font-bold text-sm">Library Group Study</span>
                      </div>
                      <ChevronRight size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 relative group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Phone className="text-blue-600" size={24} />
                <h3 className="text-xl font-black text-slate-900 uppercase italic">Key University Contacts</h3>
              </div>
              {isExec && (
                <button 
                  onClick={() => setModalType('contact')}
                  className="bg-slate-900 text-white p-2 rounded-xl"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {schoolContacts.map((contact) => (
                <div key={contact.id} className="space-y-2 relative group/item">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{contact.dept}</p>
                  <h4 className="font-bold text-slate-800">{contact.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{contact.role}</p>
                  <a href={`mailto:${contact.email}`} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                    <Mail size={12} /> {contact.email}
                  </a>
                  {isExec && (
                    <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button onClick={() => { setModalType('contact'); setEditingItem(contact); }} className="text-slate-300 hover:text-blue-600"><Edit3 size={14}/></button>
                      <button onClick={() => removeItem('contact', contact.id)} className="text-slate-300 hover:text-rose-600"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesHub;
