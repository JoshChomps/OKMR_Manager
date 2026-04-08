
import React, { useState } from 'react';
import { UserRole } from '../types';
import type { 
  User, LabBooking, InventoryItem, 
  ToolCheckout, CleaningLog, LabAccessRequest 
} from '../types';
import { 
  Calendar, Package, ClipboardCheck, Key, 
  Plus, Search, Clock, ShieldCheck, MapPin, 
  Smartphone, QrCode, Trash2, Edit3, Save, 
  X, Check, AlertCircle, Sparkles, Filter, 
  Tag, Box, ArrowRight, User as UserIcon
} from 'lucide-react';
import { parseDigikeyQR } from '../services/geminiService';

interface LabSpaceHubProps {
  currentUser: User;
  bookings: LabBooking[];
  inventory: InventoryItem[];
  checkouts: ToolCheckout[];
  cleaningLogs: CleaningLog[];
  onAddBooking: (booking: LabBooking) => void;
  onUpdateInventory: (items: InventoryItem[]) => void;
  onAddCheckout: (checkout: ToolCheckout) => void;
  onAddCleaning: (log: CleaningLog) => void;
  onRequestAccess: (requestedTime: string) => void;
  onNotify: (message: string, type: 'success' | 'info' | 'error' | 'warning') => void;
}

const LabSpaceHub: React.FC<LabSpaceHubProps> = ({
  currentUser, bookings, inventory, checkouts, cleaningLogs,
  onAddBooking, onUpdateInventory, onAddCheckout, onAddCleaning, 
  onRequestAccess, onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'inventory' | 'checkout' | 'cleaning'>('booking');
  const [showModal, setShowModal] = useState<'book' | 'inventory' | 'checkout' | 'scan' | 'access' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const isAdmin = currentUser.role === UserRole.EXECUTIVE;
  const isLead = currentUser.role === UserRole.TEAM_LEAD || isAdmin;

  const handleScanQR = async () => {
    if (!qrInput) return;
    setIsScanning(true);
    const result = await parseDigikeyQR(qrInput);
    if (result) {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.name || 'Unknown Component',
        partNumber: result.partNumber || '',
        quantity: result.quantity || 1,
        locationTag: 'UNASSIGNED',
        category: 'Electronics',
        supplier: 'Digikey',
        lastAudit: new Date().toISOString().split('T')[0]
      };
      onUpdateInventory([...inventory, newItem]);
      onNotify(`Archived: ${newItem.name}`, 'success');
      setQrInput('');
      setShowModal(null);
    } else {
      onNotify('Failed to parse Digikey QR data.', 'error');
    }
    setIsScanning(false);
  };

  const handleAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const time = fd.get('requestedTime') as string;
    
    if (!time) {
      onNotify('Please select a valid time.', 'warning');
      return;
    }

    onRequestAccess(time);
    onNotify('Access request broadcast to Lab Card holders.', 'info');
    setShowModal(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Access Control Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-900/50 transition-all">
              <Key size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">LAB TERMINAL</h2>
              <p className="text-slate-400 dark:text-slate-500 font-medium max-w-md transition-colors">Secure facility management, inventory logistics, and mission readiness tracking.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal('access')}
            className="group flex items-center gap-3 bg-white dark:bg-slate-100 text-slate-900 px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
          >
            Request Entrance <Smartphone size={20} className="group-hover:animate-bounce" />
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-[1.8rem] w-fit backdrop-blur-sm shadow-sm border border-white/50 dark:border-slate-700/50 transition-colors">
        {[
          { id: 'booking', label: 'Shop Booking', icon: <Calendar size={16} /> },
          { id: 'inventory', label: 'Inventory Hub', icon: <Package size={16} /> },
          { id: 'checkout', label: 'Gear Checkout', icon: <ClipboardCheck size={16} /> },
          { id: 'cleaning', label: 'Sanitation log', icon: <Box size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/30'}`}
          >
            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'booking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-4 transition-colors">
                <h3 className="text-xl font-black uppercase italic tracking-tight dark:text-white transition-colors">Active Reservations</h3>
                <button onClick={() => setShowModal('book')} className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"><Plus size={14}/> Reserve Slot</button>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
                {bookings.length === 0 ? (
                  <div className="p-20 text-center text-slate-300 dark:text-slate-700">
                    <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold uppercase tracking-widest text-xs">No active shop bookings recorded</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bookings.map(b => (
                      <div key={b.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 dark:text-slate-500 transition-colors">
                            {b.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white transition-colors">{b.userName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{b.purpose}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right transition-colors">
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Schedule</p>
                             <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(b.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase transition-colors">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase italic tracking-tight dark:text-white transition-colors">Shop Info</h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6 transition-colors">
                 <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl transition-colors">
                    <MapPin className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-widest">Lab Coordinates</p>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100 transition-colors">EME 1212 - Advanced Robotics</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">Active Machinery</h4>
                   {[
                     { name: 'Prusa MK4', status: 'Available' },
                     { name: 'Laser Cutter', status: 'In Use' },
                     { name: 'Solder Station', status: 'Available' },
                     { name: 'CNC Mill', status: 'Maintenance' },
                   ].map(m => (
                     <div key={m.name} className="flex items-center justify-between text-sm">
                       <span className="font-bold text-slate-700 dark:text-slate-200 transition-colors">{m.name}</span>
                       <span className={`text-[10px] font-black uppercase transition-colors ${m.status === 'Available' ? 'text-emerald-500' : m.status === 'In Use' ? 'text-blue-500' : 'text-rose-500'}`}>
                         {m.status}
                       </span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors" size={18} />
                  <input 
                    placeholder="Search mission components, NFC tags, or categories..." 
                    className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setShowModal('scan')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
                   >
                     <QrCode size={18}/> Digikey Scan
                   </button>
                   <button 
                    onClick={() => setShowModal('inventory')}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl dark:shadow-none hover:bg-slate-800 transition-all"
                   >
                     <Plus size={18}/> Manual Log
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.locationTag.includes(searchTerm)).map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl text-slate-600 dark:text-slate-400 transition-colors">
                          <Box size={24}/>
                       </div>
                       <div className="text-right transition-colors">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Qty</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">{item.quantity}</p>
                       </div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white truncate mb-1 uppercase italic tracking-tight transition-colors">{item.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 transition-colors">{item.partNumber || 'No SKU recorded'}</p>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">NFC Location</span>
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded-lg flex items-center gap-1 border border-blue-100 dark:border-blue-800 transition-colors">
                            <Tag size={10}/> {item.locationTag}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">Category</span>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 transition-colors">{item.category}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center px-4 transition-colors">
                <h3 className="text-xl font-black uppercase italic tracking-tight dark:text-white transition-colors">Tactical Gear Logistics</h3>
                <button onClick={() => setShowModal('checkout')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"><Plus size={18}/> New Checkout</button>
             </div>
             
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-colors">
                    <tr>
                      <th className="px-8 py-5">Assigned Asset</th>
                      <th className="px-8 py-5">Mission Personnel</th>
                      <th className="px-8 py-5">Deployment Date</th>
                      <th className="px-8 py-5">Return Deadline</th>
                      <th className="px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {checkouts.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic">No assets currently deployed in field operations.</td></tr>
                    ) : (
                      checkouts.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"><Box size={16}/></div>
                               <span className="font-bold text-slate-800 dark:text-slate-200 transition-colors">{c.itemName}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 font-medium text-slate-600 dark:text-slate-400 transition-colors">{c.userName}</td>
                          <td className="px-8 py-5 text-xs text-slate-400 dark:text-slate-500 font-mono transition-colors">{c.checkoutDate}</td>
                          <td className="px-8 py-5 text-xs text-slate-400 dark:text-slate-500 font-mono transition-colors">{c.expectedReturn}</td>
                          <td className="px-8 py-5">
                             <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${c.status === 'Returned' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'}`}>
                               {c.status}
                             </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'cleaning' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 transition-colors">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center shadow-xl transition-colors">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-colors">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 dark:text-white transition-colors">Mission Readiness Checklist</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-medium leading-relaxed transition-colors">Ensure a professional environment. All team leads must verify lab sanitation after technical sessions.</p>
                
                <form className="space-y-6 text-left max-w-lg mx-auto" onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  onAddCleaning({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: currentUser.id,
                    userName: currentUser.name,
                    timestamp: new Date().toISOString(),
                    task: fd.get('task') as string
                  });
                  onNotify('Mission hygiene logged.', 'success');
                }}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Area of Responsibility</label>
                      <select name="task" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all">
                         <option>Electronics Bench Cleaned</option>
                         <option>Machine Shop Swept</option>
                         <option>Battery Storage Inspected</option>
                         <option>Inventory Audit (Partial)</option>
                         <option>Floor Mopped & Trash Removed</option>
                      </select>
                   </div>
                   <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all">Log Sanitation Event</button>
                </form>
             </div>

             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-colors">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 transition-colors">Recent Sanitation Activity</h4>
                <div className="space-y-4">
                   {cleaningLogs.slice(0, 5).map(log => (
                     <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] transition-colors">{log.userName.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{log.task}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium transition-colors">Logged by {log.userName}</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono transition-colors">{new Date(log.timestamp).toLocaleDateString()}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Modals */}
       {showModal === 'access' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 transition-colors">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white transition-colors">Request Lab Entrance</h3>
                 <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <form className="space-y-8" onSubmit={handleAccessRequest}>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] flex flex-col items-center gap-4 text-center border border-blue-100 dark:border-blue-800 transition-colors">
                    <Key size={48} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium transition-colors">Specify your arrival window. Lab card holders will be notified to assist with entry.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Target Arrival Time</label>
                    <input 
                      name="requestedTime"
                      type="datetime-local" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold transition-all"
                    />
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                 >
                   Broadcast Request
                 </button>
              </form>
           </div>
        </div>
      )}

       {showModal === 'scan' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 transition-colors">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white transition-colors">Digikey Archive</h3>
                 <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <div className="space-y-8">
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] flex flex-col items-center gap-4 text-center border border-blue-100 dark:border-blue-800 transition-colors">
                    <QrCode size={64} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium transition-colors">Simulate scanner input by pasting the raw Digikey QR data string below.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Raw QR Payload</label>
                    <textarea 
                      placeholder="Paste Digikey QR data string here..." 
                      className="w-full h-32 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono dark:text-white transition-all"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                    />
                 </div>
                 <button 
                  onClick={handleScanQR}
                  disabled={isScanning || !qrInput}
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                 >
                   {isScanning ? (
                     <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Extracting Intelligence...</>
                   ) : (
                     <><Sparkles size={20}/> ARCHIVE PART</>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Manual Inventory Modal */}
      {showModal === 'inventory' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 transition-colors">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white transition-colors">New Inventory Record</h3>
                 <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const item: InventoryItem = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: fd.get('name') as string,
                  quantity: parseInt(fd.get('qty') as string),
                  locationTag: fd.get('location') as string,
                  category: fd.get('category') as string,
                  lastAudit: new Date().toISOString().split('T')[0]
                };
                onUpdateInventory([...inventory, item]);
                onNotify('Inventory record synchronized.', 'success');
                setShowModal(null);
              }}>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Asset Name</label>
                    <input name="name" required placeholder="Component or Tool Name" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Quantity</label>
                      <input name="qty" type="number" required defaultValue={1} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">NFC/Drawer Tag</label>
                      <input name="location" required placeholder="e.g. ELEC-A1" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Asset Category</label>
                    <select name="category" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none">
                       <option>Electronics</option>
                       <option>Fasteners</option>
                       <option>Structural</option>
                       <option>Power Systems</option>
                       <option>Lab Consumables</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Transmit to Mainframe</button>
              </form>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {showModal === 'book' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-300 transition-colors">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white transition-colors">Shop Space Allocation</h3>
                 <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                onAddBooking({
                  id: Math.random().toString(36).substr(2, 9),
                  userId: currentUser.id,
                  userName: currentUser.name,
                  startTime: fd.get('start') as string,
                  endTime: fd.get('end') as string,
                  purpose: fd.get('purpose') as string,
                  status: 'Confirmed'
                });
                onNotify('Shop allocation confirmed.', 'success');
                setShowModal(null);
              }}>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Mission Objective</label>
                    <input name="purpose" required placeholder="e.g. Frame fabrication for ROV v3" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none" />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">Scheduled Deployment (Start)</label>
                      <input name="start" type="datetime-local" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 transition-colors">End of Operations</label>
                      <input name="end" type="datetime-local" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold dark:text-white transition-all outline-none" />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200">Request Assignment</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default LabSpaceHub;
