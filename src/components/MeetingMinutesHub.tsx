import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import type { User, MeetingMinute } from '../types';
import { 
  FileText, Plus, Clock, Search, ChevronRight, ArrowLeft, 
  Shield, Eye, EyeOff, Trash2, Edit3, Save, X, Mic, 
  Square, Play, Sparkles, Printer, Users, 
  ListChecks, Calendar, Tag, CheckCircle2, AlertCircle
} from 'lucide-react';
import { processMeetingAudio } from '../services/geminiService';

interface MeetingMinutesHubProps {
  currentUser: User;
  minutes: MeetingMinute[];
  onAddMinutes: (minute: MeetingMinute) => void;
  onUpdateMinutes: (id: string, updates: Partial<MeetingMinute>) => void;
  onDeleteMinutes: (id: string) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error' | 'warning') => void;
}

const MeetingMinutesHub: React.FC<MeetingMinutesHubProps> = ({
  currentUser, minutes, onAddMinutes, onUpdateMinutes, onDeleteMinutes, onNotify
}) => {
  const [view, setView] = useState<'list' | 'create' | 'view'>('list');
  const [activeMinute, setActiveMinute] = useState<MeetingMinute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to resolve "Cannot find namespace 'NodeJS'" error in browser environments.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isExecutive = currentUser.role === UserRole.EXECUTIVE;

  const [formData, setFormData] = useState<Partial<MeetingMinute>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    visibility: 'Public',
    attendees: [],
    agenda: '',
    notes: '',
    actionItems: [],
    tags: []
  });

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const filteredMinutes = minutes.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const canSee = m.visibility === 'Public' || isExecutive;
    return matchesSearch && canSee;
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    onNotify("Intelligence Scribe: Active Recording Initiated.", "info");
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    onNotify("Synthesizing tactical data...", "info");

    // Simulate audio data for demonstration (In real app, we'd capture actual PCM/WAV)
    const simulatedTranscription = `Meeting: Software Sync. Participants: John, Jane, Sarah. Agenda: ROV Navigation update. John mentioned the PID controller is drifting. Jane suggested testing the IMU filtering. Sarah needs the code reviewed by Friday. New mission goal: Stable hover by next pool test on March 30th.`;

    const result = await processMeetingAudio(simulatedTranscription);
    if (result) {
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        agenda: result.agenda || prev.agenda,
        notes: result.notes || prev.notes,
        actionItems: result.actionItems || prev.actionItems
      }));
      onNotify("AI Transcription Complete: Minutes populated.", "success");
    } else {
      onNotify("AI Processing failed, please fill manually.", "error");
    }
    setIsProcessing(false);
  };

  const handleAddActionItem = () => {
    setFormData(prev => ({
      ...prev,
      actionItems: [...(prev.actionItems || []), { task: '', owner: '', deadline: '' }]
    }));
  };

  const handleSave = () => {
    if (!formData.title) {
      onNotify("Mission header (Title) is required.", "warning");
      return;
    }
    const newEntry: MeetingMinute = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title!,
      date: formData.date || new Date().toISOString().split('T')[0],
      author: currentUser.name,
      attendees: formData.attendees || [],
      agenda: formData.agenda || '',
      notes: formData.notes || '',
      actionItems: formData.actionItems || [],
      visibility: formData.visibility as any || 'Public',
      tags: formData.tags || []
    };
    onAddMinutes(newEntry);
    onNotify("Meeting records archived.", "success");
    setView('list');
    setFormData({ title: '', attendees: [], actionItems: [], visibility: 'Public', date: new Date().toISOString().split('T')[0] });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic transition-colors">MEETING RECORDS</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Strategic transcripts, mission debriefs, and action tracking.</p>
        </div>
        
        {view === 'list' && (
          <button 
            onClick={() => setView('create')}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <Plus size={18} /> New Minutes
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search archived mission records..."
              className="w-full pl-14 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all font-medium text-lg dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredMinutes.length === 0 ? (
              <div className="py-24 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] space-y-4 transition-colors">
                <FileText size={64} className="mx-auto text-slate-100 dark:text-slate-800" />
                <p className="font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">No mission records found</p>
              </div>
            ) : (
              filteredMinutes.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => { setActiveMinute(m); setView('view'); }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-blue-500 dark:hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group relative"
                >
                  <div className={`p-4 rounded-3xl shrink-0 transition-all ${m.visibility === 'Public' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-900 dark:bg-slate-950 text-slate-400 dark:text-slate-500'}`}>
                    {m.visibility === 'Public' ? <Eye size={24} /> : <Shield size={24} />}
                  </div>
                  <div className="flex-1 min-w-0 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-lg transition-colors">{m.date}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg transition-colors ${m.visibility === 'Public' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                        {m.visibility}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{m.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-medium transition-colors">{m.agenda}</p>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 transition-colors">
                    <div className="text-center transition-colors">
                       <p className="text-[9px] font-black uppercase tracking-widest mb-1">Actions</p>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">{m.actionItems.length}</p>
                    </div>
                    <div className="text-center border-l border-slate-100 dark:border-slate-800 pl-4 transition-colors">
                       <p className="text-[9px] font-black uppercase tracking-widest mb-1">Author</p>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">{m.author.split(' ')[0]}</p>
                    </div>
                    <ChevronRight size={24} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'create' && (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-colors no-print">
            <ArrowLeft size={16} /> Discard Session
          </button>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden transition-colors">
            {/* AI Assistant Section */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3 justify-center md:justify-start">
                  <Sparkles className="animate-pulse" /> Scribe Assistant
                </h3>
                <p className="text-blue-100 font-medium max-w-md">Activate the tactical recorder to automatically generate minutes using Gemini Intelligence.</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-[2.5rem] border border-white/10 shadow-inner">
                {isRecording && <div className="text-xl font-mono font-black text-rose-400 animate-pulse">{formatDuration(recordingTime)}</div>}
                {isProcessing ? (
                   <div className="flex items-center gap-3 px-6 py-3 bg-white/20 rounded-[2rem] text-sm font-black uppercase tracking-widest">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...
                   </div>
                ) : (
                  <button 
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isRecording ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    {isRecording ? <Square size={18} /> : <Mic size={18} />}
                    {isRecording ? 'Stop Mission Log' : 'Start Log'}
                  </button>
                )}
              </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Form Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Mission Header</label>
                  <input 
                    placeholder="e.g. Navigation Technical Sync"
                    className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Deployment Date</label>
                  <input 
                    type="date"
                    className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Security Level</label>
                  <select 
                    className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all"
                    value={formData.visibility}
                    onChange={(e) => setFormData({...formData, visibility: e.target.value as any})}
                  >
                    <option value="Public">Public (Full Roster)</option>
                    <option value="Executive Only">Executive Only (Redacted)</option>
                  </select>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Primary Agenda</label>
                  <textarea 
                    placeholder="Bullet points of mission goals..."
                    className="w-full h-24 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium leading-relaxed dark:text-white transition-all"
                    value={formData.agenda}
                    onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Mission Notes</label>
                  <textarea 
                    placeholder="Detailed record of the tactical discussion..."
                    className="w-full h-64 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium leading-relaxed dark:text-white transition-all"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-2 transition-colors">
                    <ListChecks className="text-blue-600 dark:text-blue-400" /> Action Directives
                  </h4>
                  <button onClick={handleAddActionItem} className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">Add Directive</button>
                </div>
                <div className="space-y-3">
                  {formData.actionItems?.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 items-end transition-colors">
                      <div className="flex-1 space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500">Task</label>
                        <input 
                          placeholder="e.g. Update PID params" 
                          className="w-full bg-white dark:bg-slate-900 border-none rounded-lg text-sm px-3 py-2 font-bold dark:text-white transition-colors"
                          value={item.task}
                          onChange={(e) => {
                            const newItems = [...(formData.actionItems || [])];
                            newItems[idx].task = e.target.value;
                            setFormData({...formData, actionItems: newItems});
                          }}
                        />
                      </div>
                      <div className="w-full md:w-48 space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500">Owner</label>
                        <input 
                          placeholder="Personnel" 
                          className="w-full bg-white dark:bg-slate-900 border-none rounded-lg text-sm px-3 py-2 font-bold dark:text-white transition-colors"
                          value={item.owner}
                          onChange={(e) => {
                            const newItems = [...(formData.actionItems || [])];
                            newItems[idx].owner = e.target.value;
                            setFormData({...formData, actionItems: newItems});
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, actionItems: formData.actionItems?.filter((_, i) => i !== idx)})}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <button 
                  onClick={handleSave}
                  className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={20} /> Archive Mission Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'view' && activeMinute && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center justify-between no-print">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-colors">
              <ArrowLeft size={16} /> Back to Archive
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                title="Print Tactical Report"
              >
                <Printer size={20} />
              </button>
              {isExecutive && (
                  <button 
                    onClick={() => onDeleteMinutes(activeMinute.id)}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    title="Purge Record"
                  >
                    <Trash2 size={20} />
                  </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden print:border-none print:shadow-none transition-colors">
            <div className={`p-12 border-b border-slate-100 dark:border-slate-800 transition-colors ${activeMinute.visibility === 'Public' ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-slate-900 dark:bg-slate-950 text-white'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg transition-colors ${activeMinute.visibility === 'Public' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-rose-900 dark:bg-rose-950 text-rose-100 dark:text-rose-400'}`}>
                      {activeMinute.visibility}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">Archived: {activeMinute.date}</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none dark:text-white transition-colors">{activeMinute.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all">
                    {activeMinute.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Recorded By</p>
                    <p className="font-bold dark:text-white transition-colors">{activeMinute.author}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-12 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-colors">
                       <Play size={14} className="fill-blue-600 dark:fill-blue-400" /> Executive Agenda
                    </h4>
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic transition-colors">
                      {activeMinute.agenda || "No tactical agenda specified."}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-colors">
                       <FileText size={14} /> Mission Debrief (Notes)
                    </h4>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                      {activeMinute.notes.split('\n').map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-colors">
                       <ListChecks size={14} /> Action Log
                    </h4>
                    <div className="space-y-3">
                      {activeMinute.actionItems.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No directives assigned.</p>
                      ) : (
                        activeMinute.actionItems.map((item, i) => (
                          <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm space-y-2 transition-colors">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{item.task}</p>
                            <div className="flex items-center justify-between">
                               <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg transition-colors">OWNER: {item.owner}</span>
                               <span className="text-[9px] font-black uppercase text-slate-400">{item.deadline || 'ASAP'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-colors">
                       <Users size={14} /> Manifest (Attendees)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeMinute.attendees.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No roster recorded.</p>
                      ) : (
                        activeMinute.attendees.map((a, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                            {a}
                          </span>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 text-center transition-colors">
                 <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center transition-colors">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Tactical Audit Complete</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium transition-colors">Record validated and stored in UBCO Marine Mainframe.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingMinutesHub;
