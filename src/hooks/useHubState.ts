import { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../types';
import type { 
  User, UserStatus, PageId, 
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
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { sheetsService } from '../services/sheetsService';

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
  const [isSyncing, setIsSyncing] = useState(false);

  // Helper for adding toasts
  const addToast = (message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  // Sync Firebase auth state with local user roster
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Attempt to find user data in our Sheet/Mock data
        const localUser = users.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        if (localUser) {
          setCurrentUser(localUser);
          setIsLoggedIn(true);
        } else {
          // If authenticated in Firebase but not in our roster, we might need to create a profile
          addToast("Account detected, but not on club roster.", "info");
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [users]);

  // Load local data on mount and trigger remote sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLocal = (key: string, initial: any) => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    };

    // Load Local Fallbacks First
    setUsers(loadLocal('marine_users', INITIAL_USERS));
    setProjects(loadLocal('marine_projects', INITIAL_PROJECTS));
    setTasks(loadLocal('marine_tasks', INITIAL_TASKS));
    setLogs(loadLocal('marine_logs', []));
    setSops(loadLocal('marine_sops', []));
    setSopSubmissions(loadLocal('marine_sop_subs', []));
    setMeetingMinutes(loadLocal('marine_minutes', []));
    setReimbursements(loadLocal('marine_reimbursements', []));
    setBudgets(loadLocal('marine_budgets', INITIAL_BUDGETS));
    setBOM(loadLocal('marine_bom', INITIAL_BOM));
    setNotifications(loadLocal('marine_notifications', []));
    setPrintQueue(loadLocal('marine_prints', []));
    setWorkOrders(loadLocal('marine_workorders', []));
    setOrderRequests(loadLocal('marine_orders', []));
    setSponsorships(loadLocal('marine_sponsorships', []));
    setFeedbackFeed(loadLocal('marine_feedback', []));
    setLabBookings(loadLocal('marine_lab_bookings', []));
    setLabInventory(loadLocal('marine_lab_inventory', []));
    setLabCheckouts(loadLocal('marine_lab_checkouts', []));
    setLabCleaning(loadLocal('marine_lab_cleaning', []));
    setResourceLinks(loadLocal('marine_res_links', INITIAL_RESOURCE_LINKS));
    setCampusResources(loadLocal('marine_res_campus', INITIAL_CAMPUS_RESOURCES));
    setSchoolContacts(loadLocal('marine_res_contacts', INITIAL_SCHOOL_CONTACTS));
    setRolePermissions(loadLocal('marine_perms', DEFAULT_PERMISSIONS));

    const savedTheme = localStorage.getItem('marine_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');

    setIsLoaded(true);

    // Synchronize from Remote Google Sheet
    syncDataFromRemote();
  }, []);

  const syncDataFromRemote = async () => {
    setIsSyncing(true);
    try {
      // Parallel fetch for core tables
      const [remoteProjects, remoteTasks, remoteUsers] = await Promise.all([
        sheetsService.fetchData<Project>('Projects'),
        sheetsService.fetchData<KanbanTask>('Tasks'),
        sheetsService.fetchData<User>('Users')
      ]);

      if (remoteProjects.length > 0) setProjects(remoteProjects);
      if (remoteTasks.length > 0) setTasks(remoteTasks);
      if (remoteUsers.length > 0) setUsers(remoteUsers);
      
      addToast("Central Data Synced", "success");
    } catch (err) {
      console.warn("Remote sync failed, using local/mock data.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Keep localStorage in sync with state changes
  useEffect(() => {
    if (!isLoaded) return;
    const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
    
    save('marine_users', users);
    save('marine_projects', projects);
    save('marine_tasks', tasks);
    save('marine_logs', logs);
    save('marine_sops', sops);
    save('marine_sop_subs', sopSubmissions);
    save('marine_minutes', meetingMinutes);
    save('marine_reimbursements', reimbursements);
    save('marine_budgets', budgets);
    save('marine_bom', bom);
    save('marine_notifications', notifications);
    save('marine_prints', printQueue);
    save('marine_workorders', workOrders);
    save('marine_orders', orderRequests);
    save('marine_sponsorships', sponsorships);
    save('marine_feedback', feedbackFeed);
    save('marine_lab_bookings', labBookings);
    save('marine_lab_inventory', labInventory);
    save('marine_lab_checkouts', labCheckouts);
    save('marine_lab_cleaning', labCleaning);
    save('marine_res_links', resourceLinks);
    save('marine_res_campus', campusResources);
    save('marine_res_contacts', schoolContacts);
    save('marine_perms', rolePermissions);
  }, [users, projects, tasks, logs, sops, sopSubmissions, meetingMinutes, reimbursements, budgets, bom, notifications, printQueue, workOrders, orderRequests, sponsorships, feedbackFeed, labBookings, labInventory, labCheckouts, labCleaning, resourceLinks, campusResources, schoolContacts, rolePermissions, isLoaded]);

  // Separate Theme Sync Effect
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('marine_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode, isLoaded]);

  const intelligenceContext = useMemo(() => `
    Context: UBCO Marine Robotics Club Hub.
    Projects: ${projects.map(p => `${p.name} at ${p.progress}%`).join(', ')}.
    Meeting Notes: ${meetingMinutes.slice(0, 5).map(m => m.title).join(', ')}.
    Team Members: ${users.length} registered members.
  `, [projects, meetingMinutes, sops, users]);

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const n: AppNotification = { id: Math.random().toString(36).substr(2, 9), title, message, timestamp: new Date().toISOString(), read: false, type };
    setNotifications(prev => [n, ...prev]);
  };

  const addLog = (type: AppLogEntry['type'], details: string) => {
    if (!currentUser) return;
    const l: AppLogEntry = { id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), userId: currentUser.id, userName: currentUser.name, type, details };
    setLogs(prev => [...prev, l]);
  };

  const handleLogin = async (email: string, password?: string) => {
    if (!password) {
      addToast("Password required.", "error");
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      const match = users.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
      if (match) {
        setCurrentUser(match);
        setIsLoggedIn(true);
        addToast(`Verified as ${match.name}`, "success");
      } else {
         addToast("Account exists in Firebase but not in the Hub Roster. Contact Execs.", "error");
         await signOut(auth); // Log them back out if not in roster
      }
    } catch (error: any) {
      console.error("Login block:", error);
      addToast("Invalid credentials", "error");
    }
  };

  const handleSignUp = async (email: string, password?: string, name?: string) => {
    if (!password || !name) {
      addToast("Name and password required for sign up.", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Create a default local user object for the roster
      const newUser: User = {
        id: fbUser.uid,
        name: name,
        email: email,
        role: UserRole.MEMBER,
        tags: ['New Member'],
        status: 'Active',
        lastActive: new Date().toISOString()
      };

      // Add to local roster
      const newRoster = [...users, newUser];
      setUsers(newRoster);
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      
      addToast(`Account created! Welcome, ${name}.`, "success");
      addLog('System', `New user registered: ${name}`);

    } catch (error: any) {
       console.error("Signup block:", error);
       if (error.code === 'auth/email-already-in-use') {
         addToast("Email already exists. Try signing in.", "error");
       } else if (error.code === 'auth/weak-password') {
         addToast("Password must be at least 6 characters.", "error");
       } else {
         addToast(error.message || "Sign up failed", "error");
       }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (err) {
      addToast("Logout failed", "error");
    }
  };

  return {
    isLoggedIn, currentUser, toasts, activePage, isSidebarOpen, authView, showNotifications, isSyncing,
    users, projects, tasks, logs, sops, sopSubmissions, meetingMinutes, reimbursements, budgets, bom, notifications,
    printQueue, workOrders, orderRequests, sponsorships, feedbackFeed, labBookings, labInventory, labCheckouts, labCleaning,
    resourceLinks, campusResources, schoolContacts, rolePermissions,
    setIsLoggedIn, setCurrentUser, setToasts, setActivePage, setIsSidebarOpen, setAuthView, setShowNotifications,
    setUsers, setProjects, setTasks, setLogs, setSops, setSopSubmissions, setMeetingMinutes, setReimbursements, setBudgets, setBOM, setNotifications,
    setPrintQueue, setWorkOrders, setOrderRequests, setSponsorships, setFeedbackFeed, setLabBookings, setLabInventory, setLabCheckouts, setLabCleaning,
    setResourceLinks, setCampusResources, setSchoolContacts, setRolePermissions, isDarkMode, setIsDarkMode,
    addToast, addNotification, addLog, handleLogin, handleSignUp, handleLogout,
    toggleDarkMode: () => setIsDarkMode(prev => !prev),
    intelligenceContext
  };
};
