
import React from 'react';
import { 
  LayoutGrid, 
  DollarSign, 
  FileText, 
  MapPin, 
  Settings, 
  Library, 
  Clock, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';
import { UserRole } from './types';
import type { PageId } from './types';

export interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  color: string;
  minRole: UserRole;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'general', label: 'Home', icon: <LayoutGrid size={20} />, color: 'bg-blue-500', minRole: UserRole.GENERAL_MEMBER },
  { id: 'finances', label: 'Finances', icon: <DollarSign size={20} />, color: 'bg-emerald-500', minRole: UserRole.TEAM_MANAGER },
  { id: 'sop', label: 'SOPs & Safety', icon: <FileText size={20} />, color: 'bg-purple-500', minRole: UserRole.GENERAL_MEMBER },
  { id: 'lab-space', label: 'Lab Portal', icon: <MapPin size={20} />, color: 'bg-orange-500', minRole: UserRole.GENERAL_MEMBER },
  { id: 'operations', label: 'Team Ops', icon: <Settings size={20} />, color: 'bg-indigo-500', minRole: UserRole.TEAM_LEAD },
  { id: 'resources', label: 'Resources', icon: <Library size={20} />, color: 'bg-cyan-500', minRole: UserRole.GENERAL_MEMBER },
  { id: 'meeting-minutes', label: 'Meeting Notes', icon: <Clock size={20} />, color: 'bg-slate-500', minRole: UserRole.GENERAL_MEMBER },
  { id: 'emergency', label: 'Emergency', icon: <AlertTriangle size={20} />, color: 'bg-red-600', minRole: UserRole.GENERAL_MEMBER },
  { id: 'admin', label: 'Admin Hub', icon: <ShieldCheck size={20} />, color: 'bg-rose-500', minRole: UserRole.EXECUTIVE },
];

export const ROLE_HIERARCHY = {
  [UserRole.EXECUTIVE]: 4,
  [UserRole.TEAM_MANAGER]: 3,
  [UserRole.TEAM_LEAD]: 2,
  [UserRole.GENERAL_MEMBER]: 1,
};
