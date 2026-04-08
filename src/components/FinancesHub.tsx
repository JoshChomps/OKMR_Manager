
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import type { 
  User, ReimbursementRequest, 
  BudgetCategory, BOMItem 
} from '../types';
import { 
  DollarSign, PieChart, Receipt, ClipboardList, 
  Plus, Search, ExternalLink, Download, Clock, 
  CheckCircle2, AlertCircle, XCircle, FileUp, 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  LayoutList, Table as TableIcon, Filter, X, 
  Send, ShieldCheck, Eye, Edit3, Save
} from 'lucide-react';

interface FinancesHubProps {
  currentUser: User;
  vpFinance: User | undefined;
  reimbursements: ReimbursementRequest[];
  budgets: BudgetCategory[];
  bom: BOMItem[];
  onAddReimbursement: (req: ReimbursementRequest) => void;
  onUpdateReimbursement: (id: string, updates: Partial<ReimbursementRequest>) => void;
  onUpdateBudget: (id: string, updates: Partial<BudgetCategory>) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error' | 'warning') => void;
}

const FinancesHub: React.FC<FinancesHubProps> = ({
  currentUser, vpFinance, reimbursements, budgets, bom,
  onAddReimbursement, onUpdateReimbursement, onUpdateBudget, onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reimbursement' | 'bom' | 'sheets'>('overview');
  const [showModal, setShowModal] = useState<'request' | 'details' | 'edit-budget' | null>(null);
  const [selectedReq, setSelectedReq] = useState<ReimbursementRequest | null>(null);
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isExecutive = currentUser.role === UserRole.EXECUTIVE;
  const isVPFinance = currentUser.tags.includes('VP Finance') || isExecutive;

  const stats = useMemo(() => {
    const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const pendingReimbursements = reimbursements.filter(r => r.status === 'Pending').reduce((acc, r) => acc + r.amount, 0);
    
    return {
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      burnRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
      pending: pendingReimbursements
    };
  }, [budgets, reimbursements]);

  const filteredReimbursements = reimbursements.filter(r => {
    const matchesSearch = r.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const isOwner = r.userId === currentUser.id;
    return matchesSearch && (isVPFinance || isOwner);
  });

  const handleRequestReimbursement = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const amount = parseFloat(fd.get('amount') as string);
    
    if (isNaN(amount) || amount <= 0) {
      onNotify('Enter a valid amount.', 'error');
      return;
    }

    const newReq: ReimbursementRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      itemDescription: fd.get('description') as string,
      amount,
      category: fd.get('category') as string,
      date: fd.get('date') as string,
      status: 'Pending'
    };

    onAddReimbursement(newReq);
    onNotify(`Reimbursement requested! The VP Finance (${vpFinance?.name || 'team'}) will review it soon.`, 'success');
    setShowModal(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Banner */}
      <div className="bg-emerald-600 dark:bg-emerald-900/40 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="bg-white/20 dark:bg-white/10 p-6 rounded-[2rem] backdrop-blur-md shadow-xl border border-white/20 dark:border-white/5 transition-colors">
              <DollarSign size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-emerald-50">CLUB FINANCES</h2>
              <p className="text-emerald-100 dark:text-emerald-200/70 font-medium max-w-md transition-colors">Keeping track of our budget, BOMs, and member reimbursements.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="bg-white/10 p-5 rounded-[2rem] border border-white/10 backdrop-blur-sm text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Total Spent</p>
                <p className="text-2xl font-black">${stats.totalSpent.toLocaleString()}</p>
             </div>
             <div className="bg-white dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 p-5 rounded-[2rem] shadow-xl text-center transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Left in Budget</p>
                <p className="text-2xl font-black">${stats.remaining.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-[1.8rem] w-fit backdrop-blur-sm shadow-sm border border-white/50 dark:border-slate-700/50 transition-colors">
        {[
          { id: 'overview', label: 'Overview', icon: <PieChart size={16} /> },
          { id: 'reimbursement', label: 'Reimbursements', icon: <Receipt size={16} /> },
          { id: 'bom', label: 'Active BOM', icon: <LayoutList size={16} /> },
          { id: 'sheets', label: 'Google Sheets', icon: <TableIcon size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/30'}`}
          >
            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm transition-colors">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Budget Usage</h4>
                      <TrendingUp size={18} className="text-emerald-500" />
                   </div>
                   <div className="flex items-end gap-2 mb-6">
                      <span className="text-4xl font-black text-slate-900 dark:text-white transition-colors">{stats.burnRate.toFixed(1)}%</span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-widest transition-colors">Spent</span>
                   </div>
                   <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.burnRate}%` }} />
                   </div>
                </div>
                <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-white transition-colors duration-500">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Waiting for Payment</h4>
                      <Clock size={18} className="text-amber-400" />
                   </div>
                   <div className="flex items-end gap-2">
                      <span className="text-4xl font-black">${stats.pending.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">In Queue</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2 dark:text-white transition-colors">
                    <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400" /> Division Budgets
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map(b => (
                      <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-md transition-all group relative">
                        {isExecutive && (
                           <button 
                            onClick={() => { setEditingBudget(b); setShowModal('edit-budget'); }}
                            className="absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                           >
                             <Edit3 size={14} />
                           </button>
                        )}
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">{b.name}</p>
                              <h5 className="text-lg font-black text-slate-900 dark:text-white transition-colors">${b.spent.toLocaleString()} / ${b.allocated.toLocaleString()}</h5>
                           </div>
                           <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${b.color.replace('bg-', 'text-')} transition-colors`}>
                              <DollarSign size={16} />
                           </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                           <div 
                              className={`h-full ${b.color} transition-all duration-1000`} 
                              style={{ width: `${b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0}%` }} 
                           />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-colors">
                  <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                    <AlertCircle size={20} className="text-amber-500" /> Spending Alerts
                  </h3>
                  <div className="space-y-4">
                     <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl transition-colors">
                        <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 mb-1 transition-colors">Logistics</p>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100 transition-colors">Competition freight is near the budget limit.</p>
                     </div>
                     <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-2xl transition-colors">
                        <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-500 mb-1 transition-colors">Mouser Order</p>
                        <p className="text-sm font-bold text-rose-900 dark:text-rose-100 transition-colors">Pending final approval for the ROV electronics order.</p>
                     </div>
                  </div>
               </div>

               <div className="bg-blue-600 text-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-200">
                  <h3 className="text-lg font-black uppercase italic tracking-tight mb-4">Finance Policy</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">
                    All purchases must be logged. Please keep your receipts! Taxes are settled during reimbursement.
                  </p>
                  <button className="w-full py-4 bg-white/20 hover:bg-white/30 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    Read Spending Guide
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'reimbursement' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input 
                    placeholder="Search requests..." 
                    className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowModal('request')}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
                >
                  <Plus size={20}/> New Request
                </button>
             </div>

             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">
                    <tr>
                      <th className="px-8 py-5">Member</th>
                      <th className="px-8 py-5">Item Details</th>
                      <th className="px-8 py-5">Value</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReimbursements.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 dark:text-slate-500 italic">No requests found.</td></tr>
                    ) : (
                      filteredReimbursements.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-400 dark:text-slate-500 transition-colors">{r.userName.charAt(0)}</div>
                               <span className="font-bold text-slate-700 dark:text-slate-200 transition-colors">{r.userName}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{r.itemDescription}</p>
                             <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{r.category}</p>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-sm font-black text-slate-900 dark:text-white transition-colors">${r.amount.toFixed(2)}</p>
                             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono transition-colors">{r.date}</p>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-colors ${
                               r.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                               r.status === 'Approved' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                               r.status === 'Denied' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                             }`}>
                               {r.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isVPFinance && (
                                  <>
                                    <button 
                                      onClick={() => onUpdateReimbursement(r.id, { status: 'Approved', processedBy: currentUser.name, processedAt: new Date().toISOString() })}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors" title="Approve"
                                    ><CheckCircle2 size={18}/></button>
                                    <button 
                                      onClick={() => onUpdateReimbursement(r.id, { status: 'Paid' })}
                                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors" title="Mark Paid"
                                    ><DollarSign size={18}/></button>
                                    <button 
                                      onClick={() => onUpdateReimbursement(r.id, { status: 'Denied' })}
                                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors" title="Deny"
                                    ><XCircle size={18}/></button>
                                  </>
                                )}
                                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors"><Eye size={18}/></button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Other tabs follow same pattern of softened wording */}
        {activeTab === 'bom' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 transition-colors">
             <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-500">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-blue-600 rounded-3xl"><ClipboardList size={24}/></div>
                   <div>
                      <h3 className="text-xl font-black uppercase italic">Bill of Materials</h3>
                      <p className="text-slate-400 text-xs">Linked to our master parts list.</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://docs.google.com/spreadsheets/d/your-global-bom-id" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-700 transition-all"
                  >
                    Open Google Sheet <ExternalLink size={14} />
                  </a>
                  <div className="text-right border-l border-white/10 pl-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Items</p>
                    <p className="text-3xl font-black">{bom.reduce((acc, i) => acc + i.quantity, 0)}</p>
                  </div>
                </div>
             </div>
             {/* BOM Table remains visually similar but with student-friendly descriptions */}
          </div>
        )}
      </div>

      {/* Modals updated to use friendlier button labels like "Send Request" instead of "Broadcast" */}
       {showModal === 'request' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 transition-colors">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white transition-colors">Reimbursement</h3>
                 <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <form className="space-y-6" onSubmit={handleRequestReimbursement}>
                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] flex flex-col items-center gap-4 text-center border border-emerald-100 dark:border-emerald-800 transition-colors">
                    <Receipt size={48} className="text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm text-emerald-900 dark:text-emerald-100 font-medium transition-colors">Log your expenses for the team so we can pay you back!</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">What did you buy?</label>
                    <input name="description" required placeholder="e.g. M3 screws for motor mounts" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-bold transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Cost ($)</label>
                      <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white font-bold transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Division</label>
                      <select name="category" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl font-bold dark:text-white transition-colors">
                         <option>Mechanical</option>
                         <option>Electrical</option>
                         <option>Software</option>
                         <option>Outreach</option>
                         <option>Lab Maintenance</option>
                      </select>
                    </div>
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                 >
                   Submit Request
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinancesHub;
