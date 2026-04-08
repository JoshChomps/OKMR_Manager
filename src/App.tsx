
import React from 'react';
import { UserRole } from './types';
import type { 
  User, PageId, KanbanTask, HubFeedback, 
  ReimbursementRequest, BudgetCategory, LabBooking, 
  ToolCheckout, CleaningLog, SOP, SOPSubmission, 
  MeetingMinute, RolePermissions 
} from './types';
import Sidebar from './components/Sidebar';
import AdminHub from './components/AdminHub';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/ProfileSettings';
import GeneralHub from './components/GeneralHub';
import SOPHub from './components/SOPHub';
import ResourcesHub from './components/ResourcesHub';
import OperationsHub from './components/OperationsHub';
import MeetingMinutesHub from './components/MeetingMinutesHub';
import EmergencyHub from './components/EmergencyHub';
import LabSpaceHub from './components/LabSpaceHub';
import FinancesHub from './components/FinancesHub';
import HubChatbot from './components/HubChatbot';
import { useHubState } from './hooks/useHubState';
import { 
  Menu, UserCircle, Bell, CheckCircle2
} from 'lucide-react';

const App: React.FC = () => {
  const {
    isLoggedIn, currentUser, toasts, activePage, isSidebarOpen, showNotifications,
    users, projects, tasks, logs, sops, sopSubmissions, meetingMinutes, reimbursements, budgets, bom, notifications,
    printQueue, workOrders, orderRequests, sponsorships, feedbackFeed, labBookings, labInventory, labCheckouts, labCleaning,
    rolePermissions, isDarkMode,
    setCurrentUser, setActivePage, setIsSidebarOpen, setShowNotifications,
    setUsers, setProjects, setTasks, setSops, setSopSubmissions, setMeetingMinutes, setReimbursements, setBudgets, setBOM,
    setPrintQueue, setWorkOrders, setOrderRequests, setSponsorships, setFeedbackFeed, setLabBookings, setLabInventory, setLabCheckouts, setLabCleaning,
    setRolePermissions, toggleDarkMode,
    addToast, addNotification, handleLogin,
    intelligenceContext
  } = useHubState();

  const renderContent = () => {
    if (!currentUser) return null;
    switch(activePage) {
      case 'profile': 
        return <ProfileSettings 
          user={currentUser} 
          onUpdate={(u: Partial<User>) => { 
            setUsers(users.map((us: User) => us.id === currentUser.id ? {...us, ...u} : us)); 
            setCurrentUser({...currentUser, ...u}); 
            addToast("Profile Updated!", "success"); 
          }} 
        />;
      case 'admin': 
        return <AdminHub 
          users={users} 
          logs={logs} 
          permissions={rolePermissions} 
          onUpdateUser={(id: string, up: Partial<User>) => setUsers(users.map((u: User) => u.id === id ? {...u, ...up} : u))} 
          onDeleteUser={(id: string) => setUsers(users.filter((u: User) => u.id !== id))} 
          onUpdatePermissions={(r: UserRole, k: keyof RolePermissions, v: boolean) => setRolePermissions({...rolePermissions, [r]: {...rolePermissions[r], [k]: v}})} 
        />;
      case 'general': 
        return <GeneralHub 
          projects={projects} 
          tasks={tasks} 
          announcements={[]} 
          events={[]} 
          operationalUpdates={feedbackFeed.filter((f: HubFeedback) => f.type === 'Update')} 
          userRole={currentUser.role} 
          permissions={rolePermissions[currentUser.role]} 
          onAddTask={(t: KanbanTask) => setTasks([...tasks, t])} 
          onUpdateTask={(id: string, u: Partial<KanbanTask>) => setTasks(tasks.map((t: KanbanTask) => t.id === id ? {...t, ...u} : t))} 
          onPostAnnouncement={() => {}} 
          onUpdateEvent={() => {}} 
          onAddEvent={() => {}} 
          onNotify={addToast} 
        />;
      case 'finances': 
        return <FinancesHub 
          currentUser={currentUser} 
          vpFinance={users.find((u: User) => u.tags.includes('VP Finance'))} 
          reimbursements={reimbursements} 
          budgets={budgets} 
          bom={bom} 
          onAddReimbursement={(r: ReimbursementRequest) => { 
            setReimbursements([r, ...reimbursements]); 
            addNotification("New Reimbursement", r.itemDescription, "user_request"); 
          }} 
          onUpdateReimbursement={(id: string, u: Partial<ReimbursementRequest>) => setReimbursements(reimbursements.map((r: ReimbursementRequest) => r.id === id ? {...r, ...u} : r))} 
          onUpdateBudget={(id: string, u: Partial<BudgetCategory>) => setBudgets(budgets.map((b: BudgetCategory) => b.id === id ? {...b, ...u} : b))} 
          onNotify={addToast} 
        />;
      case 'lab-space': 
        return <LabSpaceHub 
          currentUser={currentUser} 
          bookings={labBookings} 
          inventory={labInventory} 
          checkouts={labCheckouts} 
          cleaningLogs={labCleaning} 
          onAddBooking={(b: LabBooking) => setLabBookings([b, ...labBookings])} 
          onUpdateInventory={setLabInventory} 
          onAddCheckout={(c: ToolCheckout) => setLabCheckouts([c, ...labCheckouts])} 
          onAddCleaning={(l: CleaningLog) => setLabCleaning([l, ...labCleaning])} 
          onRequestAccess={(time: string) => addNotification("Lab Access", `${currentUser.name} requested entry at ${time}`, "user_request")} 
          onNotify={addToast} 
        />;
      case 'sop': 
        return <SOPHub 
          sops={sops} 
          submissions={sopSubmissions} 
          userRole={currentUser.role} 
          userName={currentUser.name} 
          userId={currentUser.id} 
          permissions={rolePermissions[currentUser.role]} 
          onNotify={addToast} 
          onAddSOP={(s: SOP) => setSops([...sops, s])} 
          onSubmitSOP={(sub: SOPSubmission) => setSopSubmissions([sub, ...sopSubmissions])} 
        />;
      case 'meeting-minutes': 
        return <MeetingMinutesHub 
          currentUser={currentUser} 
          minutes={meetingMinutes} 
          onAddMinutes={(m: MeetingMinute) => setMeetingMinutes([m, ...meetingMinutes])} 
          onUpdateMinutes={(id: string, u: Partial<MeetingMinute>) => setMeetingMinutes(meetingMinutes.map((m: MeetingMinute) => m.id === id ? {...m, ...u} : m))} 
          onDeleteMinutes={(id: string) => setMeetingMinutes(meetingMinutes.filter((m: MeetingMinute) => m.id !== id))} 
          onNotify={addToast} 
        />;
      case 'operations': 
        return <OperationsHub 
          currentUser={currentUser} 
          users={users} 
          printQueue={printQueue} 
          workOrders={workOrders} 
          orderRequests={orderRequests} 
          sponsorships={sponsorships} 
          feedback={feedbackFeed} 
          onUpdatePrintQueue={setPrintQueue} 
          onUpdateWorkOrders={setWorkOrders} 
          onUpdateOrderRequests={setOrderRequests} 
          onUpdateSponsorships={setSponsorships} 
          onUpdateFeedback={setFeedbackFeed} 
          onNotify={addToast} 
        />;
      case 'emergency': 
        return <EmergencyHub 
          executives={users.filter((u: User) => u.role === UserRole.EXECUTIVE)} 
          emergencySops={sops.filter((s: SOP) => s.category === 'Emergency')} 
          onStartSop={() => setActivePage('sop')} 
        />;
      default: return <Dashboard onNavigate={setActivePage} userName={currentUser.name} />;
    }
  };

  if (!isLoggedIn || !currentUser) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black shadow-xl">M</div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2 dark:text-white">Team Hub</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-10">UBCO Marine Robotics Portal</p>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(new FormData(e.currentTarget as any).get('email') as string); }} className="space-y-4">
          <input name="email" required placeholder="Your Email" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all" />
          <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95">Sign In</button>
        </form>
        <div className="mt-10 grid grid-cols-2 gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <button onClick={() => handleLogin('exec@ubcomarine.com')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all">Exec Demo</button>
          <button onClick={() => handleLogin('member@ubcomarine.com')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all">Member Demo</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:pl-64 transition-colors duration-500">
      <Sidebar 
        currentRole={currentUser.role} 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => setCurrentUser(null)} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
      />
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between no-print shadow-sm transition-colors">
        <span className="font-black text-slate-900 dark:text-white italic uppercase lg:hidden">Team Hub</span>
        <div className="hidden lg:block"></div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-xl transition-all relative ${notifications.some(n => !n.read) ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 dark:text-slate-500'}`}>
                <Bell size={20}/>
                {notifications.some(n => !n.read) && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-600 rounded-full border-2 border-white dark:border-slate-900"></span>}
              </button>
           </div>
           <button onClick={() => setActivePage('profile')} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all bg-white dark:bg-slate-800 dark:text-slate-300 shadow-sm">
            <UserCircle size={18} className="text-blue-600"/> <span className="hidden sm:inline">{currentUser.name}</span>
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden dark:text-white"><Menu size={22}/></button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6 md:p-10 lg:p-14">{renderContent()}</main>
      <HubChatbot appContext={intelligenceContext} />
      
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full no-print">
        {toasts.map(t => (
          <div key={t.id} className={`p-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${t.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100' : 'bg-blue-50/90 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'}`}>
             <CheckCircle2 size={20} className={t.type === 'success' ? 'text-emerald-600' : 'text-blue-600'} />
             <p className="text-xs font-black uppercase tracking-widest">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
