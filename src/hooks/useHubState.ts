import { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../types';
import type { 
  User, UserStatus, PageId, ModuleData, 
  AppLogEntry, Project, KanbanTask, Announcement, 
  ClubEvent, RolePermissions, SOP, SOPSubmission, 
  Toast, AppNotification, ResourceLink, CampusResource, 
  SchoolContact, PrintJob, WorkOrder, OrderRequest, 
  SponsorshipContact, HubFeedback, MeetingMinute,
  LabBooking, InventoryItem, ToolCheckout, CleaningLog,
  ReimbursementRequest, BudgetCategory, BOMItem 
} from '../types';
import {
  INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_RESOURCE_LINKS,
  INITIAL_CAMPUS_RESOURCES, INITIAL_SCHOOL_CONTACTS,
  INITIAL_BUDGETS, INITIAL_BOM, INITIAL_USERS,
  DEFAULT_PERMISSIONS
} from '../mockData';

export const useHubState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activePage, setActivePage] = useState<PageId>('general');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('marine_theme') === 'dark' || 
             (!localStorage.getItem('marine_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // States with Persistence
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('marine_users') || JSON.stringify(INITIAL_USERS)));
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('marine_projects') || JSON.stringify(INITIAL_PROJECTS)));
  const [tasks, setTasks] = useState<KanbanTask[]>(() => JSON.parse(localStorage.getItem('marine_tasks') || JSON.stringify(INITIAL_TASKS)));
  const [logs, setLogs] = useState<AppLogEntry[]>(() => JSON.parse(localStorage.getItem('marine_logs') || '[]'));
  const [sops, setSops] = useState<SOP[]>(() => JSON.parse(localStorage.getItem('marine_sops') || '[]'));
  const [sopSubmissions, setSopSubmissions] = useState<SOPSubmission[]>(() => JSON.parse(localStorage.getItem('marine_sop_subs') || '[]'));
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>(() => JSON.parse(localStorage.getItem('marine_minutes') || '[]'));
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>(() => JSON.parse(localStorage.getItem('marine_reimbursements') || '[]'));
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => JSON.parse(localStorage.getItem('marine_budgets') || JSON.stringify(INITIAL_BUDGETS)));
  const [bom, setBOM] = useState<BOMItem[]>(() => JSON.parse(localStorage.getItem('marine_bom') || JSON.stringify(INITIAL_BOM)));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => JSON.parse(localStorage.getItem('marine_notifications') || '[]'));

  // Ops States
  const [printQueue, setPrintQueue] = useState<PrintJob[]>(() => JSON.parse(localStorage.getItem('marine_prints') || '[]'));
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => JSON.parse(localStorage.getItem('marine_workorders') || '[]'));
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>(() => JSON.parse(localStorage.getItem('marine_orders') || '[]'));
  const [sponsorships, setSponsorships] = useState<SponsorshipContact[]>(() => JSON.parse(localStorage.getItem('marine_sponsorships') || '[]'));
  const [feedbackFeed, setFeedbackFeed] = useState<HubFeedback[]>(() => JSON.parse(localStorage.getItem('marine_feedback') || '[]'));
  const [labBookings, setLabBookings] = useState<LabBooking[]>(() => JSON.parse(localStorage.getItem('marine_lab_bookings') || '[]'));
  const [labInventory, setLabInventory] = useState<InventoryItem[]>(() => JSON.parse(localStorage.getItem('marine_lab_inventory') || '[]'));
  const [labCheckouts, setLabCheckouts] = useState<ToolCheckout[]>(() => JSON.parse(localStorage.getItem('marine_lab_checkouts') || '[]'));
  const [labCleaning, setLabCleaning] = useState<CleaningLog[]>(() => JSON.parse(localStorage.getItem('marine_lab_cleaning') || '[]'));
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>(() => JSON.parse(localStorage.getItem('marine_res_links') || JSON.stringify(INITIAL_RESOURCE_LINKS)));
  const [campusResources, setCampusResources] = useState<CampusResource[]>(() => JSON.parse(localStorage.getItem('marine_res_campus') || JSON.stringify(INITIAL_CAMPUS_RESOURCES)));
  const [schoolContacts, setSchoolContacts] = useState<SchoolContact[]>(() => JSON.parse(localStorage.getItem('marine_res_contacts') || JSON.stringify(INITIAL_SCHOOL_CONTACTS)));
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(() => JSON.parse(localStorage.getItem('marine_perms') || JSON.stringify(DEFAULT_PERMISSIONS)));

  useEffect(() => {
    localStorage.setItem('marine_users', JSON.stringify(users));
    localStorage.setItem('marine_projects', JSON.stringify(projects));
    localStorage.setItem('marine_tasks', JSON.stringify(tasks));
    localStorage.setItem('marine_logs', JSON.stringify(logs));
    localStorage.setItem('marine_sops', JSON.stringify(sops));
    localStorage.setItem('marine_sop_subs', JSON.stringify(sopSubmissions));
    localStorage.setItem('marine_minutes', JSON.stringify(meetingMinutes));
    localStorage.setItem('marine_reimbursements', JSON.stringify(reimbursements));
    localStorage.setItem('marine_budgets', JSON.stringify(budgets));
    localStorage.setItem('marine_bom', JSON.stringify(bom));
    localStorage.setItem('marine_notifications', JSON.stringify(notifications));
    localStorage.setItem('marine_prints', JSON.stringify(printQueue));
    localStorage.setItem('marine_workorders', JSON.stringify(workOrders));
    localStorage.setItem('marine_orders', JSON.stringify(orderRequests));
    localStorage.setItem('marine_sponsorships', JSON.stringify(sponsorships));
    localStorage.setItem('marine_feedback', JSON.stringify(feedbackFeed));
    localStorage.setItem('marine_lab_bookings', JSON.stringify(labBookings));
    localStorage.setItem('marine_lab_inventory', JSON.stringify(labInventory));
    localStorage.setItem('marine_lab_checkouts', JSON.stringify(labCheckouts));
    localStorage.setItem('marine_lab_cleaning', JSON.stringify(labCleaning));
    localStorage.setItem('marine_res_links', JSON.stringify(resourceLinks));
    localStorage.setItem('marine_res_campus', JSON.stringify(campusResources));
    localStorage.setItem('marine_res_contacts', JSON.stringify(schoolContacts));
    localStorage.setItem('marine_perms', JSON.stringify(rolePermissions));
    localStorage.setItem('marine_theme', isDarkMode ? 'dark' : 'light');
    
    // Sync with DOM
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [users, projects, tasks, logs, sops, sopSubmissions, meetingMinutes, reimbursements, budgets, bom, notifications, printQueue, workOrders, orderRequests, sponsorships, feedbackFeed, labBookings, labInventory, labCheckouts, labCleaning, resourceLinks, campusResources, schoolContacts, rolePermissions, isDarkMode]);

  const intelligenceContext = useMemo(() => `
    Context: UBCO Marine Robotics Club Hub.
    Projects: ${projects.map(p => `${p.name} at ${p.progress}%`).join(', ')}.
    Meeting Notes: ${meetingMinutes.slice(0, 5).map(m => m.title).join(', ')}.
    SOPs: ${sops.map(s => s.title).join(', ')}.
    Team Members: ${users.length} registered members.
  `, [projects, meetingMinutes, sops, users]);

  const addToast = (message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const n: AppNotification = { id: Math.random().toString(36).substr(2, 9), title, message, timestamp: new Date().toISOString(), read: false, type };
    setNotifications(prev => [n, ...prev]);
  };

  const addLog = (type: AppLogEntry['type'], details: string) => {
    if (!currentUser) return;
    const l: AppLogEntry = { id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), userId: currentUser.id, userName: currentUser.name, type, details };
    setLogs(prev => [...prev, l]);
  };

  const handleLogin = (email: string) => {
    const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (user.status === 'rejected' as UserStatus) { addToast("Access Denied.", "error"); return; }
      setCurrentUser(user);
      setIsLoggedIn(true);
      addLog('system_login', 'Signed in.');
      addToast(`Welcome back, ${user.name}!`, "success");
    } else { addToast("Email not found on our roster.", "error"); }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return {
    isLoggedIn, currentUser, toasts, activePage, isSidebarOpen, authView, showNotifications,
    users, projects, tasks, logs, sops, sopSubmissions, meetingMinutes, reimbursements, budgets, bom, notifications,
    printQueue, workOrders, orderRequests, sponsorships, feedbackFeed, labBookings, labInventory, labCheckouts, labCleaning,
    resourceLinks, campusResources, schoolContacts, rolePermissions,
    setIsLoggedIn, setCurrentUser, setToasts, setActivePage, setIsSidebarOpen, setAuthView, setShowNotifications,
    setUsers, setProjects, setTasks, setLogs, setSops, setSopSubmissions, setMeetingMinutes, setReimbursements, setBudgets, setBOM, setNotifications,
    setPrintQueue, setWorkOrders, setOrderRequests, setSponsorships, setFeedbackFeed, setLabBookings, setLabInventory, setLabCheckouts, setLabCleaning,
    setResourceLinks, setCampusResources, setSchoolContacts, setRolePermissions, isDarkMode, setIsDarkMode,
    addToast, addNotification, addLog, handleLogin, handleLogout,
    toggleDarkMode: () => setIsDarkMode(prev => !prev),
    intelligenceContext
  };
};
