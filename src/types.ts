
export enum UserRole {
  EXECUTIVE = 'Executive',
  TEAM_MANAGER = 'Team Manager',
  TEAM_LEAD = 'Team Lead',
  GENERAL_MEMBER = 'General Member'
}

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tags: string[];
  joinedAt: string;
  status: UserStatus;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  onboardingCompleted: boolean;
  lastActive?: string;
}

export interface ResourceLink {
  id: string;
  label: string;
  url: string;
  desc: string;
  color: string;
}

export interface CampusResource {
  id: string;
  title: string;
  contact: string;
  loc: string;
  desc: string;
}

export interface SchoolContact {
  id: string;
  name: string;
  role: string;
  email: string;
  dept: string;
}

export interface LabBooking {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'Confirmed' | 'Pending Approval';
}

export interface InventoryItem {
  id: string;
  name: string;
  partNumber?: string;
  locationTag: string; // NFC/Location Identifier
  quantity: number;
  category: string;
  supplier?: 'Digikey' | 'Mouser' | 'Amazon' | 'Other';
  lastAudit: string;
}

export interface ToolCheckout {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  checkoutDate: string;
  expectedReturn: string;
  status: 'Checked Out' | 'Returned';
}

export interface CleaningLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  task: string;
}

export interface LabAccessRequest {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  requestedTime?: string;
  status: 'Requested' | 'Granted' | 'Denied';
}

export interface ReimbursementRequest {
  id: string;
  userId: string;
  userName: string;
  itemDescription: string;
  amount: number;
  category: string;
  date: string;
  receiptUrl?: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Denied';
  processedBy?: string;
  processedAt?: string;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category: string;
  status: 'Draft' | 'Ordered' | 'Received';
}

export interface MeetingMinute {
  id: string;
  title: string;
  date: string;
  author: string;
  attendees: string[];
  agenda: string;
  notes: string;
  actionItems: { task: string; owner: string; deadline: string }[];
  visibility: 'Public' | 'Executive Only';
  audioUrl?: string;
  transcription?: string;
  tags: string[];
}

export interface PrintJob {
  id: string;
  fileName: string;
  material: string;
  color: string;
  status: 'Pending' | 'Slicing' | 'Printing' | 'Finished' | 'Failed';
  uploader: string;
  timestamp: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Review' | 'Closed';
  createdBy: string;
  createdAt: string;
}

export interface OrderRequest {
  id: string;
  itemName: string;
  sourceUrl: string;
  price: number;
  quantity: number;
  reason: string;
  status: 'Awaiting Approval' | 'Approved' | 'Ordered' | 'Arrived' | 'Denied';
  requester: string;
  timestamp: string;
}

export interface SponsorshipContact {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  status: 'Contacted' | 'Meeting' | 'Negotiation' | 'Secured' | 'Declined';
  lastFollowUp: string;
  notes: string;
}

export type FeedbackVisibility = 'Executive Only' | 'Team Lead+' | 'Public';

export interface HubFeedback {
  id: string;
  userName: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'Request' | 'Update' | 'Feedback';
  visibility?: FeedbackVisibility;
  target?: string;
}


export interface AppLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  type: 'content_edit' | 'user_approval' | 'system_login' | 'sop_submission' | 'feedback' | 'request' | 'announcement' | 'task_update' | 'event_update' | 'sop_creation';
  details: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  isMandatory: boolean;
  team?: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  status: 'In Progress' | 'Completed' | 'Blocked' | 'Planning';
  startDate: string;
  deadline: string;
  team: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  status: 'Todo' | 'Doing' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  team?: string;
}

export type EventType = 'Division' | 'Team Meeting' | 'Social' | 'Deadline' | 'Competition';

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  description: string;
  team?: string;
}

export type SOPStepType = 'info' | 'checkbox' | 'text_input' | 'image_upload';

export interface SOPStep {
  id: string;
  type: SOPStepType;
  label: string;
  description?: string;
  required: boolean;
  instructionMedia?: {
    url: string;
    type: 'image' | 'video';
  };
}

export interface SOP {
  id: string;
  title: string;
  description: string;
  steps: SOPStep[];
  createdBy: string;
  createdAt: string;
  category: string;
}

export interface SOPSubmission {
  id: string;
  sopId: string;
  sopTitle: string;
  userId: string;
  userName: string;
  timestamp: string;
  responses: Record<string, any>;
  isCompleted: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'sop_completion' | 'user_request' | 'system';
  metadata?: any;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface RolePermissions {
  canEditKanban: boolean;
  canEditCalendar: boolean;
  canPostAnnouncements: boolean;
  canEditModuleContent: boolean;
  canManageUsers: boolean;
  canCreateSOP: boolean;
}

export type PageId = 
  | 'general' 
  | 'finances' 
  | 'sop' 
  | 'lab-space' 
  | 'operations' 
  | 'resources' 
  | 'meeting-minutes' 
  | 'emergency'
  | 'admin'
  | 'profile';
