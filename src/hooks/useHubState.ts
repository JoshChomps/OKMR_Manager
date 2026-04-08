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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // States with Persistence (Initialized with mock data for SSR safety)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS);
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [sopSubmissions, setSopSubmissions] = useState<SOPSubmission[]>([]);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);
  const [bom, setBOM] = useState<BOMItem[]>(INITIAL_BOM);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [sponsorships, setSponsorships] = useState<SponsorshipContact[]>([]);
  const [feedbackFeed, setFeedbackFeed] = useState<HubFeedback[]>([]);
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [labInventory, setLabInventory] = useState<InventoryItem[]>([]);
  const [labCheckouts, setLabCheckouts] = useState<ToolCheckout[]>([]);
  const [labCleaning, setLabCleaning] = useState<CleaningLog[]>([]);
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>(INITIAL_RESOURCE_LINKS);
  const [campusResources, setCampusResources] = useState<CampusResource[]>(INITIAL_CAMPUS_RESOURCES);
  const [schoolContacts, setSchoolContacts] = useState<SchoolContact[]>(INITIAL_SCHOOL_CONTACTS);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(DEFAULT_PERMISSIONS);

  const [isLoaded, setIsLoaded] = useState(false);

  // Mount Effect: Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const load = (key: string, initial: any) => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    };

    setUsers(load('marine_users', INITIAL_USERS));
    setProjects(load('marine_projects', INITIAL_PROJECTS));
    setTasks(load('marine_tasks', INITIAL_TASKS));
    setLogs(load('marine_logs', []));
    setSops(load('marine_sops', []));
    setSopSubmissions(load('marine_sop_subs', []));
    setMeetingMinutes(load('marine_minutes', []));
    setReimbursements(load('marine_reimbursements', []));
    setBudgets(load('marine_budgets', INITIAL_BUDGETS));
    setBOM(load('marine_bom', INITIAL_BOM));
    setNotifications(load('marine_notifications', []));
    setPrintQueue(load('marine_prints', []));
    setWorkOrders(load('marine_workorders', []));
    setOrderRequests(load('marine_orders', []));
    setSponsorships(load('marine_sponsorships', []));
    setFeedbackFeed(load('marine_feedback', []));
    setLabBookings(load('marine_lab_bookings', []));
    setLabInventory(load('marine_lab_inventory', []));
    setLabCheckouts(load('marine_lab_checkouts', []));
    setLabCleaning(load('marine_lab_cleaning', []));
    setResourceLinks(load('marine_res_links', INITIAL_RESOURCE_LINKS));
    setCampusResources(load('marine_res_campus', INITIAL_CAMPUS_RESOURCES));
    setSchoolContacts(load('marine_res_contacts', INITIAL_SCHOOL_CONTACTS));
    setRolePermissions(load('marine_perms', DEFAULT_PERMISSIONS));

    const savedTheme = localStorage.getItem('marine_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');

    setIsLoaded(true);
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (!isLoaded) return;

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
  }, [users, projects, tasks, logs, sops, sopSubmissions, meetingMinutes, reimbursements, budgets, bom, notifications, printQueue, workOrders, orderRequests, sponsorships, feedbackFeed, labBookings, labInventory, labCheckouts, labCleaning, resourceLinks, campusResources, schoolContacts, rolePermissions, isLoaded]);

  // Separate Theme Sync Effect
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('marine_theme', isDarkMode ? 'dark' : 'light');
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isLoaded]);

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
