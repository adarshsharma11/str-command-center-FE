// Core Data Models for STR Command & Control Platform

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type TaskType = 'Cleaning' | 'Maintenance' | 'Guest Issue';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type PlatformName = 'Airbnb' | 'Vrbo' | 'Direct';
export type ReservationStatus = 'Confirmed' | 'Reserved' | 'Blocked';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type SyncStatus = 'Synced' | 'Error' | 'Pending';
export type InternalStatus = 'Active' | 'Inactive' | 'Maintenance';
export type TriggerEvent = 'NewBooking' | 'CheckOut' | 'MessageReceived' | 'GuestCheckIn';
export type RuleAction = 'SendMessage' | 'CreateTask' | 'NotifyCrew' | 'SendEmail';

export interface Property {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  internalStatus: InternalStatus;
  imageUrl?: string;
}

export interface Listing {
  id: string;
  propertyId: string;
  platformName: PlatformName;
  platformListingId: string;
  syncStatus: SyncStatus;
  trustScore: number; // 0-100
  lastSyncedAt: Date;
}

export interface Task {
  id: string;
  priority: Priority;
  type: TaskType;
  title: string;
  description: string;
  assignedCrewId?: string;
  assignedCrewName?: string;
  bookingId?: string;
  propertyId: string;
  status: TaskStatus;
  dueDate: Date;
  completionLog?: {
    completedBy: string;
    completedAt: Date;
    notes?: string;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: TriggerEvent;
  condition: string;
  action: RuleAction;
  actionDetails: string;
  isActive: boolean;
  createdAt: Date;
  lastExecuted?: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  platform: PlatformName;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  bookingId?: string;
  platform?: PlatformName;
}

export interface Conversation {
  id: string;
  guestName: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  bookingId?: string;
  platform?: PlatformName;
}

export interface Crew {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: TaskType[];
  tasksAssigned: number;
  tasksCompleted: number;
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: Date;
  outcome: 'Success' | 'Failed' | 'Skipped';
  affectedBookingId?: string;
  details: string;
}
