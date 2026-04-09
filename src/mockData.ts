
import { UserRole } from './types';
import type { 
  Project, KanbanTask, RolePermissions, 
  ResourceLink, CampusResource, SchoolContact, BudgetCategory, 
  BOMItem, User, UserStatus
} from './types';

export const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'ROV Divergence Hull', progress: 85, status: 'In Progress', startDate: '2024-01-01', deadline: '2024-04-15', team: 'Mechanical' },
  { id: '2', name: 'Autonomy Logic Node', progress: 45, status: 'In Progress', startDate: '2024-02-15', deadline: '2024-05-01', team: 'Software' },
  { id: '3', name: 'Power Distribution v3', progress: 10, status: 'Blocked', startDate: '2024-03-01', deadline: '2024-04-30', team: 'Electrical' },
];

export const INITIAL_TASKS: KanbanTask[] = [
  { id: '1', title: 'Pressure Test Acrylic Dome', status: 'Todo', priority: 'High', assignee: 'Jane Manager', team: 'Mechanical' },
  { id: '2', title: 'IMU Calibration Script', status: 'Doing', priority: 'Medium', assignee: 'John Lead', team: 'Software' },
];


export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.EXECUTIVE]: { canEditKanban: true, canEditCalendar: true, canPostAnnouncements: true, canEditModuleContent: true, canManageUsers: true, canCreateSOP: true },
  [UserRole.TEAM_MANAGER]: { canEditKanban: true, canEditCalendar: true, canPostAnnouncements: true, canEditModuleContent: false, canManageUsers: false, canCreateSOP: true },
  [UserRole.TEAM_LEAD]: { canEditKanban: true, canEditCalendar: true, canPostAnnouncements: true, canEditModuleContent: false, canManageUsers: false, canCreateSOP: false },
  [UserRole.GENERAL_MEMBER]: { canEditKanban: false, canEditCalendar: false, canPostAnnouncements: false, canEditModuleContent: false, canManageUsers: false, canCreateSOP: false },
};

export const INITIAL_RESOURCE_LINKS: ResourceLink[] = [
  { id: '1', label: 'Team Google Drive', url: 'https://drive.google.com', color: 'bg-blue-500', desc: 'All our project files and documentation.' },
  { id: '2', label: 'Discord Server', url: 'https://discord.com', color: 'bg-indigo-500', desc: 'Our main place for chatting and quick updates.' },
  { id: '3', label: 'GitHub Repo', url: 'https://github.com', color: 'bg-slate-800', desc: 'Source code for our ROVs and software.' },
];

export const INITIAL_CAMPUS_RESOURCES: CampusResource[] = [
  { id: '1', title: 'EME Machine Shop', contact: 'eme.shop@ubco.ca', loc: 'EME 0011', desc: 'Fabrication and CNC support from the shop techs.' },
  { id: '2', title: 'UBCO Library', contact: 'library.ubco@ubc.ca', loc: 'LIB Building', desc: 'Research papers and study spaces.' },
];

export const INITIAL_SCHOOL_CONTACTS: SchoolContact[] = [
  { id: '1', name: 'Dr. Faculty Advisor', role: 'Club Advisor', email: 'advisor@ubc.ca', dept: 'Engineering' },
];

export const INITIAL_BUDGETS: BudgetCategory[] = [
  { id: '1', name: 'Mechanical', allocated: 5000, spent: 3450, color: 'bg-blue-500' },
  { id: '2', name: 'Electrical', allocated: 4500, spent: 1200, color: 'bg-emerald-500' },
  { id: '3', name: 'Software', allocated: 2000, spent: 850, color: 'bg-indigo-500' },
  { id: '4', name: 'Outreach', allocated: 3000, spent: 2100, color: 'bg-rose-500' },
];

export const INITIAL_BOM: BOMItem[] = [
  { id: '1', name: 'Blue Robotics Thruster', quantity: 6, unitPrice: 250, subtotal: 1500, category: 'Mechanical', status: 'Received' },
  { id: '2', name: 'Custom PCB Board v3', quantity: 2, unitPrice: 45, subtotal: 90, category: 'Electrical', status: 'Ordered' },
];

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'Executive Admin', email: 'exec@ubcomarine.com', role: UserRole.EXECUTIVE, tags: ['Board', 'Safety Lead', 'Systems', 'VP Finance'], joinedAt: '2023-09-01', status: 'approved', onboardingCompleted: true, lastActive: new Date().toISOString() },
  { id: '2', name: 'Jane Manager', email: 'manager@ubcomarine.com', role: UserRole.TEAM_MANAGER, tags: ['Electrical', 'Budget'], joinedAt: '2023-10-15', status: 'approved', onboardingCompleted: true, lastActive: new Date().toISOString() },
  { id: '3', name: 'John Lead', email: 'lead@ubcomarine.com', role: UserRole.TEAM_LEAD, tags: ['Software', 'ROV-Alpha'], joinedAt: '2024-01-20', status: 'approved', onboardingCompleted: true, lastActive: new Date().toISOString() },
  { id: '4', name: 'General Member', email: 'member@ubcomarine.com', role: UserRole.GENERAL_MEMBER, tags: ['Trainee'], joinedAt: '2024-03-05', status: 'approved', onboardingCompleted: true, lastActive: new Date().toISOString() },
];
