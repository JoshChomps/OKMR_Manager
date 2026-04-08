
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import type { Project, KanbanTask, Announcement, ClubEvent, RolePermissions, EventType, HubFeedback } from '../types';
import { 
  Calendar, Layout, BarChart2, Bell, MessageSquare, 
  ChevronRight, MoreVertical, Plus, Clock, AlertCircle,
  Trello, ListTodo, TrendingUp, CalendarDays, Filter, X,
  ChevronLeft, Users, Briefcase, MapPin, Radio, Sparkles,
  GanttChart
} from 'lucide-react';
import { generateWeeklyBriefing } from '../services/geminiService';

interface GeneralHubProps {
  projects: Project[];
  tasks: KanbanTask[];
  announcements: Announcement[];
  events: ClubEvent[];
  operationalUpdates: HubFeedback[];
  userRole: UserRole;
  permissions: RolePermissions;
  onAddTask: (task: KanbanTask) => void;
  onUpdateTask: (id: string, updates: Partial<KanbanTask>) => void;
  onPostAnnouncement: (announcement: Announcement) => void;
  onUpdateEvent: (id: string, updates: Partial<ClubEvent>) => void;
  onAddEvent: (event: ClubEvent) => void;
  onNotify: (msg: string, type: any) => void;
}

const GeneralHub: React.FC<GeneralHubProps> = ({ 
  projects, tasks, announcements, events, operationalUpdates, userRole, permissions,
  onAddTask, onUpdateTask, onPostAnnouncement, onUpdateEvent, onAddEvent, onNotify
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'updates' | 'progress' | 'tasks' | 'calendar' | 'timeline'>('updates');
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [weeklyBriefing, setWeeklyBriefing] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventFilter, setEventFilter] = useState<EventType | 'All'>('All');

  const filteredEvents = useMemo(() => {
    return eventFilter === 'All' ? events : events.filter(e => e.type === eventFilter);
  }, [events, eventFilter]);

  const canEditKanban = permissions.canEditKanban;
  const canEditCalendar = permissions.canEditCalendar;
  const canPostAnnounce = permissions.canPostAnnouncements;

  const handleGenerateBriefing = async () => {
    setIsBriefingLoading(true);
    const context = `Projects: ${JSON.stringify(projects)}. Announcements: ${JSON.stringify(announcements.slice(0, 5))}. Tasks remaining: ${tasks.filter(t => t.status !== 'Done').length}`;
    const briefing = await generateWeeklyBriefing(context);
    setWeeklyBriefing(briefing || null);
    setIsBriefingLoading(false);
  };

  const renderUpdates = () => (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* AI Briefing Trigger */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Weekly Command Briefing</h3>
          <p className="text-slate-400 text-sm font-medium max-w-md">Synthesize recent mission logs and technical progress into a high-level summary.</p>
        </div>
        <button 
          onClick={handleGenerateBriefing}
          disabled={isBriefingLoading}
          className="relative group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-blue-900/40"
        >
          {isBriefingLoading ? <Clock className="animate-spin" size={18}/> : <Sparkles size={18}/>}
          {isBriefingLoading ? 'Synthesizing...' : 'Generate Briefing'}
        </button>
      </div>

      {weeklyBriefing && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-[2.5rem] p-10 animate-in slide-in-from-top-4 transition-colors">
           <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-blue-900 dark:text-blue-200 uppercase italic tracking-tight flex items-center gap-2"><Radio size={18}/> Mission Recap (Automated)</h4>
              <button onClick={() => setWeeklyBriefing(null)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"><X size={20}/></button>
           </div>
           <div className="prose prose-blue dark:prose-invert prose-sm max-w-none text-blue-800 dark:text-blue-100 font-medium whitespace-pre-wrap leading-relaxed transition-colors">
             {weeklyBriefing}
           </div>
        </div>
      )}

      {/* Operational Updates - Dedicated Space */}
      {operationalUpdates.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl transition-colors">
               <Radio size={20} className="animate-pulse" />
             </div>
             <div>
               <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic tracking-tight transition-colors">Mission Live Feed</h3>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Real-time Field Updates & Operations</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operationalUpdates.slice(0, 6).map(update => (
              <div key={update.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-bl-[2rem] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                 <div className="flex items-center justify-between mb-4 relative">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xs font-bold">
                       {update.userName.charAt(0)}
                     </div>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">{update.userName}</span>
                   </div>
                   <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 transition-colors">{new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic relative transition-colors">
                   "{update.content}"
                 </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Announcements */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl transition-colors">
               <Bell size={20} />
             </div>
             <div>
               <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic tracking-tight transition-colors">Broadcast Center</h3>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Formal Club Announcements</p>
             </div>
          </div>
          {canPostAnnounce && (
            <button 
              onClick={() => setShowAnnounceModal(true)}
              className="text-xs bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={16} className="inline mr-1" /> New Post
            </button>
          )}
        </div>

        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className={`p-6 rounded-[2.5rem] border transition-all ${ann.isMandatory ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${ann.isMandatory ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                  {ann.isMandatory ? <AlertCircle size={24} /> : <MessageSquare size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tight transition-colors">{ann.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">{new Date(ann.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">{ann.content}</p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">Posted by {ann.author}</span>
                    {ann.team && <span className="bg-slate-900 dark:bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter transition-colors">{ann.team}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in overflow-x-auto transition-colors">
       <div className="flex items-center justify-between mb-10 px-2">
          <div>
            <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter transition-colors">Tactical Synchronization (Gantt)</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">March - April 2024 Operations</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600"></div> <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Mechanical</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-600"></div> <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Electrical</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-600"></div> <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Software</span></div>
          </div>
       </div>

       <div className="min-w-[800px] space-y-6">
          <div className="grid grid-cols-12 gap-0 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">
             <div className="col-span-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Personnel/Division</div>
             <div className="col-span-9 grid grid-cols-8">
                {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map(w => (
                  <div key={w} className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600">{w}</div>
                ))}
             </div>
          </div>
          
          {projects.map(p => (
            <div key={p.id} className="grid grid-cols-12 items-center h-12 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
               <div className="col-span-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-[10px] ${p.team === 'Electrical' ? 'bg-emerald-600' : p.team === 'Software' ? 'bg-indigo-600' : 'bg-blue-600'}`}>{p.team.charAt(0)}</div>
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 truncate transition-colors">{p.name}</span>
               </div>
               <div className="col-span-9 grid grid-cols-8 items-center h-full relative px-4">
                  <div className="absolute inset-0 grid grid-cols-8 h-full">
                     {Array.from({length: 8}).map((_, i) => <div key={i} className="border-l border-slate-100 dark:border-slate-800 h-full first:border-none transition-colors"></div>)}
                  </div>
                  <div 
                    className={`h-4 rounded-full shadow-sm transition-all duration-700 relative z-10 ${p.team === 'Electrical' ? 'bg-emerald-500' : p.team === 'Software' ? 'bg-indigo-500' : 'bg-blue-500'}`}
                    style={{ gridColumnStart: Math.floor(Math.random() * 3) + 1, gridColumnEnd: 'span 4' }}
                  >
                    <div className="absolute inset-y-0 left-0 bg-white/20 h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                    <span className="absolute -top-5 left-0 text-[8px] font-black uppercase text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">Progress: {p.progress}%</span>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic transition-colors">General Terminal</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Mission coordination, scheduling, and tactical team updates.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-[1.5rem] w-fit backdrop-blur-sm sticky top-4 z-20 shadow-sm border border-white/50 dark:border-slate-700/50 transition-colors">
        {[
          { id: 'updates', icon: Bell, label: 'Broadcasts' },
          { id: 'progress', icon: TrendingUp, label: 'Milestones' },
          { id: 'timeline', icon: GanttChart, label: 'Timeline' },
          { id: 'tasks', icon: Trello, label: 'Workflows' },
          { id: 'calendar', icon: CalendarDays, label: 'Schedule' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/30'}`}
          >
            <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeSubTab === 'updates' && renderUpdates()}
        {activeSubTab === 'progress' && (
           <div className="space-y-8 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                     <TrendingUp size={20} className="text-emerald-500" /> Active Milestones
                   </h3>
                 </div>
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 shadow-sm transition-colors">
                   {projects.map(proj => (
                     <div key={proj.id} className="space-y-3">
                       <div className="flex justify-between items-end">
                         <div>
                           <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 transition-colors">{proj.team} Team</span>
                           <h4 className="text-md font-bold text-slate-800 dark:text-slate-200 transition-colors">{proj.name}</h4>
                         </div>
                         <span className="text-lg font-black text-blue-600 dark:text-blue-400 mb-1 leading-none">{proj.progress}%</span>
                       </div>
                       <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                         <div className={`h-full transition-all duration-1000 ease-out rounded-full ${proj.status === 'Blocked' ? 'bg-rose-500' : proj.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${proj.progress}%` }} />
                       </div>
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                         <span className={`px-2 py-0.5 rounded transition-colors ${proj.status === 'Blocked' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>{proj.status}</span>
                         <span className="text-slate-400 dark:text-slate-500 uppercase">Target: {proj.deadline}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="space-y-6">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                   <BarChart2 size={20} className="text-blue-500" /> Operational Metrics
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-6 flex flex-col justify-between h-40 shadow-xl shadow-slate-200 dark:shadow-none transition-colors duration-500">
                     <div className="flex items-center justify-between">
                       <ListTodo className="text-blue-400" size={24} />
                       <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">TASKS</span>
                     </div>
                     <div><p className="text-4xl font-black mb-1">{tasks.filter(t => t.status !== 'Done').length}</p><p className="text-xs font-medium text-slate-400">Awaiting action</p></div>
                   </div>
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-40 shadow-sm transition-colors">
                     <div className="flex items-center justify-between">
                       <Clock className="text-amber-500" size={24} />
                       <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">UPCOMING</span>
                     </div>
                     <div><p className="text-4xl font-black text-slate-800 dark:text-white mb-1 transition-colors">{events.length}</p><p className="text-xs font-medium text-slate-400">Scheduled events</p></div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        )}
        {activeSubTab === 'timeline' && renderTimeline()}
        {activeSubTab === 'tasks' && (
           <div className="space-y-6 animate-in fade-in duration-300 overflow-x-auto transition-colors">
             <div className="flex items-center justify-between min-w-[800px] mb-2 px-2">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors"><Trello className="text-indigo-500" size={20} /> Team Workflow</h3>
             </div>
             <div className="flex gap-6 min-w-[800px]">
               {(['Todo', 'Doing', 'Done'] as const).map(column => (
                 <div key={column} className="flex-1 space-y-4">
                   <div className="flex items-center justify-between px-3">
                     <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${column === 'Todo' ? 'bg-slate-400' : column === 'Doing' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div><h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{column}</h4></div>
                     <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === column).length}</span>
                   </div>
                   <div className="bg-slate-200/30 dark:bg-slate-800/50 rounded-[2rem] p-3 min-h-[500px] space-y-3 transition-colors">
                     {tasks.filter(t => t.status === column).map(task => (
                       <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md">
                         <div className="flex items-start justify-between"><p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug transition-colors">{task.title}</p></div>
                         <div className="flex items-center justify-between">
                           <div className="flex gap-1.5"><span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full transition-colors ${task.priority === 'High' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : task.priority === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{task.priority}</span>{task.team && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors">{task.team}</span>}</div>
                           <div className="w-7 h-7 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-white dark:border-slate-700 shadow-sm transition-colors">{task.assignee.charAt(0)}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
        {activeSubTab === 'calendar' && (
           <div className="space-y-6 animate-in fade-in duration-300 transition-colors">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors"><CalendarDays className="text-blue-500" size={20} /> Operational Timeline</h3>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors">
                 <div className="grid grid-cols-7 gap-1">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (<div key={d} className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 py-3 uppercase tracking-widest">{d}</div>))}
                   {Array.from({length: 31}).map((_, i) => (
                     <div key={i} className={`min-h-[100px] border border-slate-50 dark:border-slate-800 rounded-3xl p-3 flex flex-col transition-all cursor-pointer group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${selectedDate.getDate() === i+1 ? 'ring-2 ring-blue-500 bg-blue-50/20 dark:bg-blue-900/20' : ''}`}>
                       <span className={`text-xs font-bold mb-2 w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${new Date().getDate() === i+1 ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>{i + 1}</span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
        )}
      </div>

    </div>
  );
};

export default GeneralHub;
