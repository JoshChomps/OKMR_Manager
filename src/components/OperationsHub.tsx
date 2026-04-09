
import React, { useState } from 'react';
import { UserRole } from '../types';
import type { User, PrintJob, WorkOrder, OrderRequest, SponsorshipContact, HubFeedback, FeedbackVisibility } from '../types';
import { 
  Printer, ClipboardList, ShoppingCart, MessageSquare, Handshake, 
  Plus, Trash2, Edit3, X, Save, ExternalLink, Filter, 
  Search, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, ArrowRight, User as UserIcon, Building2, Tag, DollarSign,
  ShieldAlert, Send, Eye, EyeOff, Users, Target, Info
} from 'lucide-react';

interface OperationsHubProps {
  currentUser: User;
  users: User[];
  printQueue: PrintJob[];
  workOrders: WorkOrder[];
  orderRequests: OrderRequest[];
  sponsorships: SponsorshipContact[];
  feedback: HubFeedback[];
  onUpdatePrintQueue: (jobs: PrintJob[]) => void;
  onUpdateWorkOrders: (orders: WorkOrder[]) => void;
  onUpdateOrderRequests: (requests: OrderRequest[]) => void;
  onUpdateSponsorships: (contacts: SponsorshipContact[]) => void;
  onUpdateFeedback: (items: HubFeedback[]) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error' | 'warning') => void;
}

const OperationsHub: React.FC<OperationsHubProps> = ({
  currentUser, users, printQueue, workOrders, orderRequests, sponsorships, feedback,
  onUpdatePrintQueue, onUpdateWorkOrders, onUpdateOrderRequests, onUpdateSponsorships, onUpdateFeedback, onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'prints' | 'workorders' | 'orders' | 'feedback' | 'sponsorship'>('prints');
  const [modalType, setModalType] = useState<'print' | 'workorder' | 'order' | 'sponsorship' | 'feedback' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formFeedbackType, setFormFeedbackType] = useState<'Request' | 'Update' | 'Feedback'>('Feedback');

  const isExecutive = currentUser.role === UserRole.EXECUTIVE;
  const isManager = currentUser.role === UserRole.TEAM_MANAGER || isExecutive;
  const isLead = currentUser.role === UserRole.TEAM_LEAD || isManager;

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setFormFeedbackType('Feedback');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const id = editingItem?.id || Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    if (modalType === 'print') {
      const job: PrintJob = {
        id,
        fileName: fd.get('fileName') as string,
        material: fd.get('material') as string,
        color: fd.get('color') as string,
        status: editingItem?.status || 'Pending',
        uploader: editingItem?.uploader || currentUser.name,
        timestamp: editingItem?.timestamp || timestamp,
        notes: fd.get('notes') as string
      };
      onUpdatePrintQueue(editingItem ? printQueue.map(p => p.id === id ? job : p) : [...printQueue, job]);
    } else if (modalType === 'workorder') {
      const order: WorkOrder = {
        id,
        title: fd.get('title') as string,
        description: fd.get('description') as string,
        assignedTo: fd.get('assignedTo') as string,
        priority: fd.get('priority') as any,
        status: editingItem?.status || 'Open',
        createdBy: editingItem?.createdBy || currentUser.name,
        createdAt: editingItem?.createdAt || timestamp
      };
      onUpdateWorkOrders(editingItem ? workOrders.map(w => w.id === id ? order : w) : [...workOrders, order]);
    } else if (modalType === 'order') {
      const req: OrderRequest = {
        id,
        itemName: fd.get('itemName') as string,
        sourceUrl: fd.get('sourceUrl') as string,
        price: parseFloat(fd.get('price') as string),
        quantity: parseInt(fd.get('quantity') as string),
        reason: fd.get('reason') as string,
        status: editingItem?.status || 'Awaiting Approval',
        requester: editingItem?.requester || currentUser.name,
        timestamp: editingItem?.timestamp || timestamp
      };
      onUpdateOrderRequests(editingItem ? orderRequests.map(o => o.id === id ? req : o) : [...orderRequests, req]);
    } else if (modalType === 'sponsorship') {
      const contact: SponsorshipContact = {
        id,
        company: fd.get('company') as string,
        contactPerson: fd.get('contactPerson') as string,
        email: fd.get('email') as string,
        status: fd.get('status') as any,
        lastFollowUp: fd.get('lastFollowUp') as string,
        notes: fd.get('notes') as string
      };
      onUpdateSponsorships(editingItem ? sponsorships.map(s => s.id === id ? contact : s) : [...sponsorships, contact]);
    } else if (modalType === 'feedback') {
      const item: HubFeedback = {
        id,
        userName: editingItem?.userName || currentUser.name,
        userId: editingItem?.userId || currentUser.id,
        content: fd.get('content') as string,
        type: formFeedbackType,
        timestamp: editingItem?.timestamp || timestamp,
        visibility: fd.get('visibility') as FeedbackVisibility,
        target: fd.get('target') as string
      };
      if (editingItem) {
        onUpdateFeedback(feedback.map(f => f.id === id ? item : f));
      } else {
        onUpdateFeedback([item, ...feedback]);
      }
    }

    onNotify('Operational data synchronized', 'success');
    closeModal();
  };

  const renderModal = () => {
    if (!modalType) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">
              {editingItem ? 'Update' : 'Initialize'} {modalType === 'feedback' ? formFeedbackType : modalType.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
          </div>
          <form className="space-y-6" onSubmit={handleSave}>
            {modalType === 'print' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">File Name</label>
                  <input name="fileName" required defaultValue={editingItem?.fileName} placeholder="ROV_Propeller_V2.stl" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none dark:text-white transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Material</label>
                    <select name="material" defaultValue={editingItem?.material || 'PLA'} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all">
                      <option>PLA</option>
                      <option>PETG</option>
                      <option>ABS</option>
                      <option>ASA</option>
                      <option>TPU</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Color</label>
                    <input name="color" defaultValue={editingItem?.color || 'Black'} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Print Notes</label>
                  <textarea name="notes" defaultValue={editingItem?.notes} placeholder="Infill 40%, supports required..." className="w-full h-24 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none transition-all" />
                </div>
              </>
            )}

            {modalType === 'workorder' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Objective Title</label>
                  <input name="title" required defaultValue={editingItem?.title} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Assign To</label>
                    <input name="assignedTo" required defaultValue={editingItem?.assignedTo} placeholder="Team or Name" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Priority</label>
                    <select name="priority" defaultValue={editingItem?.priority || 'Medium'} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Instructions</label>
                  <textarea name="description" required defaultValue={editingItem?.description} className="w-full h-24 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none transition-all" />
                </div>
              </>
            )}

            {modalType === 'order' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Part/Item Name</label>
                  <input name="itemName" required defaultValue={editingItem?.itemName} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Source URL</label>
                  <input name="sourceUrl" required defaultValue={editingItem?.sourceUrl} placeholder="https://..." className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Unit Price ($)</label>
                    <input name="price" type="number" step="0.01" required defaultValue={editingItem?.price} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Quantity</label>
                    <input name="quantity" type="number" required defaultValue={editingItem?.quantity || 1} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Justification</label>
                  <textarea name="reason" required defaultValue={editingItem?.reason} placeholder="Why is this needed for mission success?" className="w-full h-20 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none transition-all" />
                </div>
              </>
            )}

            {modalType === 'sponsorship' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Company Name</label>
                  <input name="company" required defaultValue={editingItem?.company} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Contact Person</label>
                    <input name="contactPerson" defaultValue={editingItem?.contactPerson} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Status</label>
                    <select name="status" defaultValue={editingItem?.status || 'Contacted'} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all">
                      <option>Contacted</option>
                      <option>Meeting</option>
                      <option>Negotiation</option>
                      <option>Secured</option>
                      <option>Declined</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Contact Email</label>
                  <input name="email" type="email" defaultValue={editingItem?.email} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Engagement Notes</label>
                  <textarea name="notes" defaultValue={editingItem?.notes} className="w-full h-20 px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none transition-all" />
                </div>
              </>
            )}

            {modalType === 'feedback' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Transmission Type</label>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl transition-colors">
                    {['Feedback', 'Update', 'Request'].map(t => (
                      <button 
                        key={t}
                        type="button"
                        onClick={() => setFormFeedbackType(t as any)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${formFeedbackType === t ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {formFeedbackType === 'Feedback' && (
                  <div className="space-y-2 animate-in fade-in transition-colors">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Sharing Level (Privacy)</label>
                    <select name="visibility" defaultValue={editingItem?.visibility || 'Executive Only'} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all">
                      <option value="Executive Only">Executive Only</option>
                      <option value="Team Lead+">Team Lead+</option>
                      <option value="Public">Public (Full Club)</option>
                    </select>
                  </div>
                )}

                {formFeedbackType === 'Request' && (
                  <div className="space-y-2 animate-in fade-in transition-colors">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Target Recipient (Person or Team)</label>
                    <input name="target" required defaultValue={editingItem?.target} placeholder="e.g. Software Team or John Smith" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none dark:text-white transition-all" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Message Content</label>
                  <textarea name="content" required defaultValue={editingItem?.content} placeholder="Share details..." className="w-full h-32 px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none transition-all" />
                </div>
                
                {formFeedbackType === 'Update' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 animate-in fade-in">
                    <Info className="text-blue-600 shrink-0" size={18} />
                    <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed">
                      Updates are shared directly on the club's homepage for visibility.
                    </p>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl dark:shadow-none flex items-center justify-center gap-2 transition-colors duration-500">
              <Send size={18} /> {editingItem ? 'Update Broadcast' : 'Transmit Record'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const updateStatus = (type: string, id: string, newStatus: string) => {
    if (type === 'print') onUpdatePrintQueue(printQueue.map(p => p.id === id ? {...p, status: newStatus as any} : p));
    if (type === 'workorder') onUpdateWorkOrders(workOrders.map(w => w.id === id ? {...w, status: newStatus as any} : w));
    if (type === 'order') onUpdateOrderRequests(orderRequests.map(o => o.id === id ? {...o, status: newStatus as any} : o));
    onNotify('Status updated', 'info');
  };

  const removeEntry = (type: string, id: string) => {
    if (!confirm('Confirm removal of this operational entry?')) return;
    if (type === 'print') onUpdatePrintQueue(printQueue.filter(p => p.id !== id));
    if (type === 'workorder') onUpdateWorkOrders(workOrders.filter(w => w.id !== id));
    if (type === 'order') onUpdateOrderRequests(orderRequests.filter(o => o.id !== id));
    if (type === 'sponsorship') onUpdateSponsorships(sponsorships.filter(s => s.id !== id));
    if (type === 'feedback') onUpdateFeedback(feedback.filter(f => f.id !== id));
    onNotify('Entry removed from command records', 'warning');
  };

  // Visibility filtering logic for Feed tab
  const visibleFeedItems = feedback.filter(item => {
    // Updates are semi-public (homepage bound), but we filter them in this tab to only show relevant context
    if (item.type === 'Update') return true; 

    // Requests: Only sender, target, and Executives can see
    if (item.type === 'Request') {
      if (isExecutive) return true;
      if (item.userId === currentUser.id) return true;
      if (item.target && (currentUser.name.includes(item.target) || currentUser.tags.some(t => item.target?.includes(t)))) return true;
      return false;
    }

    // Feedback: Privacy level based
    if (item.type === 'Feedback') {
      if (isExecutive) return true; // Execs see all feedback
      if (item.userId === currentUser.id) return true; // Creator sees own
      if (item.visibility === 'Public') return true;
      if (item.visibility === 'Team Lead+' && isLead) return true;
      return false;
    }

    return false;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {renderModal()}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="transition-colors">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic transition-colors">OPERATIONS COMMAND</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Logistics, manufacturing, procurement, and external outreach.</p>
        </div>
        
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit backdrop-blur-sm border border-white/50 dark:border-slate-700/50 transition-colors">
          {[
            { id: 'prints', label: '3D Prints', icon: <Printer size={16} /> },
            { id: 'workorders', label: 'Work Orders', icon: <ClipboardList size={16} /> },
            { id: 'orders', label: 'Procurement', icon: <ShoppingCart size={16} /> },
            { id: 'sponsorship', label: 'Outreach', icon: <Handshake size={16} /> },
            { id: 'feedback', label: 'Secure Comms', icon: <MessageSquare size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'prints' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center transition-colors">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Active Print Queue</h3>
            <button onClick={() => setModalType('print')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"><Plus size={16}/> New Print</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printQueue.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 transition-colors"><Printer size={20}/></div>
                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                    job.status === 'Finished' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                    job.status === 'Printing' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 animate-pulse' :
                    job.status === 'Failed' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                  }`}>
                    {job.status}
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1 transition-colors">{job.fileName}</h4>
                <div className="flex gap-2 mb-4">
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 transition-colors">{job.material}</span>
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 transition-colors">{job.color}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500 transition-colors">{job.uploader.charAt(0)}</div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">{job.uploader}</span>
                  </div>
                  {isManager && (
                    <select 
                      className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-lg p-1"
                      value={job.status}
                      onChange={(e) => updateStatus('print', job.id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>Slicing</option>
                      <option>Printing</option>
                      <option>Finished</option>
                      <option>Failed</option>
                    </select>
                  )}
                </div>
                {isExecutive && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setModalType('print'); setEditingItem(job); }} className="p-2 bg-white/80 backdrop-blur shadow rounded-full text-slate-400 hover:text-blue-600"><Edit3 size={14}/></button>
                    <button onClick={() => removeEntry('print', job.id)} className="p-2 bg-white/80 backdrop-blur shadow rounded-full text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'workorders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center transition-colors">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Mission Objectives</h3>
            <button onClick={() => setModalType('workorder')} className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"><Plus size={16}/> New Work Order</button>
          </div>
          <div className="space-y-4">
            {workOrders.map(order => (
              <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
                <div className={`p-4 rounded-2xl shrink-0 transition-all ${
                  order.priority === 'Critical' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' :
                  order.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <ClipboardList size={24}/>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1 justify-center md:justify-start">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{order.title}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg transition-colors ${
                      order.status === 'Closed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
                      order.status === 'Review' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 transition-colors">{order.description}</p>
                </div>
                <div className="flex items-center gap-8 pr-4">
                   <div className="text-center transition-colors">
                     <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1">Assigned To</p>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors">{order.assignedTo}</p>
                   </div>
                   {isManager && (
                     <select 
                      value={order.status}
                      onChange={(e) => updateStatus('workorder', order.id, e.target.value)}
                      className="text-xs font-black uppercase bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-xl outline-none"
                     >
                       <option>Open</option>
                       <option>In Progress</option>
                       <option>Review</option>
                       <option>Closed</option>
                     </select>
                   )}
                </div>
                {isExecutive && (
                  <div className="flex gap-2">
                    <button onClick={() => { setModalType('workorder'); setEditingItem(order); }} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => removeEntry('workorder', order.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center transition-colors">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Procurement Pipeline</h3>
            <button onClick={() => setModalType('order')} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"><Plus size={16}/> Request Part</button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">
                <tr>
                  <th className="px-8 py-4">Item & Source</th>
                  <th className="px-8 py-4">Total Value</th>
                  <th className="px-8 py-4">Requester</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {orderRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm transition-colors">{req.itemName}</p>
                        <a href={req.sourceUrl} target="_blank" className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center gap-1 mt-1 hover:underline transition-colors">
                          View Vendor <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white transition-colors">${(req.price * req.quantity).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 transition-colors">{req.quantity} x ${req.price}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors">{req.requester}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                        req.status === 'Arrived' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                        req.status === 'Ordered' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
                        req.status === 'Denied' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {isExecutive && (
                           <>
                             <select 
                              onChange={(e) => updateStatus('order', req.id, e.target.value)}
                              className="text-[10px] font-black uppercase bg-white border border-slate-200 rounded-lg py-1 px-2"
                             >
                               <option value="">Update Status</option>
                               <option>Approved</option>
                               <option>Ordered</option>
                               <option>Arrived</option>
                               <option>Denied</option>
                             </select>
                             <button onClick={() => { setModalType('order'); setEditingItem(req); }} className="p-2 text-slate-300 hover:text-blue-600"><Edit3 size={16}/></button>
                           </>
                         )}
                         <button onClick={() => removeEntry('order', req.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sponsorship' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center transition-colors">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Sponsorship Outreach</h3>
            <button onClick={() => setModalType('sponsorship')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"><Plus size={16}/> New Contact</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsorships.map(sp => (
              <div key={sp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all relative group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center shadow-inner transition-colors">
                    <Building2 size={24}/>
                  </div>
                  <div className="transition-colors">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{sp.company}</h4>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{sp.status}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase transition-colors">Contact</span>
                    <span className="text-slate-700 dark:text-slate-300 font-black transition-colors">{sp.contactPerson || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase transition-colors">Last Follow-up</span>
                    <span className="text-slate-700 dark:text-slate-300 font-black transition-colors">{sp.lastFollowUp || 'None'}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed transition-colors">"{sp.notes}"</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 flex gap-2">
                   <a href={`mailto:${sp.email}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                     <MessageSquare size={14}/> Reach Out
                   </a>
                   {isExecutive && (
                     <button onClick={() => { setModalType('sponsorship'); setEditingItem(sp); }} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit3 size={16}/></button>
                   )}
                   <button onClick={() => removeEntry('sponsorship', sp.id)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:text-rose-600 dark:hover:text-rose-400 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Tactical Comms Feed</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">Secure requests, updates, and feedback logs.</p>
                </div>
                <button onClick={() => setModalType('feedback')} className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 transition-all"><Plus size={16}/> New Transmission</button>
             </div>
             
             <div className="space-y-6">
               {visibleFeedItems.length === 0 ? (
                 <div className="py-20 text-center text-slate-300 dark:text-slate-700 transition-colors">
                    <ShieldAlert size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold uppercase tracking-widest text-xs">No secure records found in your jurisdiction</p>
                 </div>
               ) : (
                 visibleFeedItems.map(item => (
                   <div key={item.id} className="flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[2rem] transition-all group relative border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                     <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-inner transition-colors">
                        {item.type === 'Request' ? <Target size={20}/> : item.type === 'Update' ? <Clock size={20}/> : <MessageSquare size={20}/>}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                         <div className="flex flex-wrap items-center gap-2">
                           <span className="font-bold text-slate-900 dark:text-white text-sm transition-colors">{item.userName}</span>
                           <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm transition-colors ${
                             item.type === 'Request' ? 'bg-amber-600 text-white' :
                             item.type === 'Update' ? 'bg-emerald-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white'
                           }`}>{item.type}</span>
                           
                           {item.type === 'Feedback' && (
                             <span className="text-[8px] font-black text-slate-400 transition-colors border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                {item.visibility === 'Public' ? <Eye size={10}/> : <EyeOff size={10}/>} {item.visibility}
                             </span>
                           )}

                           {item.type === 'Request' && item.target && (
                             <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors">
                               <ArrowRight size={10}/> TO: {item.target}
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-3 shrink-0">
                           <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono transition-colors">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           {(isExecutive || item.userId === currentUser.id) && (
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setModalType('feedback'); setEditingItem(item); setFormFeedbackType(item.type); }} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm transition-colors"><Edit3 size={14}/></button>
                               <button onClick={() => removeEntry('feedback', item.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm transition-colors"><Trash2 size={14}/></button>
                             </div>
                           )}
                         </div>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-white/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 transition-colors italic">
                          {item.content}
                       </p>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsHub;
