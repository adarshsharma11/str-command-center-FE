// Mock data for development - TODO: Replace with Supabase queries

import type { 
  Property, Listing, Task, Booking, Message, Conversation, 
  Crew, KPI, Alert, AutomationRule, ExecutionLog 
} from '@/types';

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    name: 'Beachfront Villa',
    address: '123 Ocean Drive, Miami, FL',
    ownerId: 'owner-1',
    internalStatus: 'Active',
  },
  {
    id: 'prop-2',
    name: 'Downtown Loft',
    address: '456 Main St, Austin, TX',
    ownerId: 'owner-1',
    internalStatus: 'Active',
  },
  {
    id: 'prop-3',
    name: 'Mountain Cabin',
    address: '789 Pine Rd, Aspen, CO',
    ownerId: 'owner-2',
    internalStatus: 'Maintenance',
  },
];

export const mockListings: Listing[] = [
  {
    id: 'list-1',
    propertyId: 'prop-1',
    platformName: 'Airbnb',
    platformListingId: 'ABB-123456',
    syncStatus: 'Synced',
    trustScore: 95,
    lastSyncedAt: new Date('2025-01-27T10:00:00'),
  },
  {
    id: 'list-2',
    propertyId: 'prop-1',
    platformName: 'Vrbo',
    platformListingId: 'VRB-789012',
    syncStatus: 'Synced',
    trustScore: 88,
    lastSyncedAt: new Date('2025-01-27T09:30:00'),
  },
  {
    id: 'list-3',
    propertyId: 'prop-2',
    platformName: 'Airbnb',
    platformListingId: 'ABB-345678',
    syncStatus: 'Error',
    trustScore: 72,
    lastSyncedAt: new Date('2025-01-26T15:00:00'),
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    priority: 'P1',
    type: 'Cleaning',
    title: 'Emergency Clean - Beachfront Villa',
    description: 'Guest reported spill in living room',
    assignedCrewId: 'crew-1',
    assignedCrewName: 'Premium Clean Co.',
    bookingId: 'book-1',
    propertyId: 'prop-1',
    status: 'In Progress',
    dueDate: new Date('2025-01-28T14:00:00'),
  },
  {
    id: 'task-2',
    priority: 'P2',
    type: 'Maintenance',
    title: 'HVAC Filter Replacement',
    description: 'Scheduled maintenance',
    propertyId: 'prop-2',
    status: 'Pending',
    dueDate: new Date('2025-01-29T10:00:00'),
  },
  {
    id: 'task-3',
    priority: 'P3',
    type: 'Guest Issue',
    title: 'WiFi Password Request',
    description: 'Guest needs WiFi info',
    assignedCrewId: 'crew-2',
    assignedCrewName: 'Support Team',
    bookingId: 'book-2',
    propertyId: 'prop-1',
    status: 'Completed',
    dueDate: new Date('2025-01-27T12:00:00'),
    completionLog: {
      completedBy: 'John Doe',
      completedAt: new Date('2025-01-27T11:30:00'),
      notes: 'Password sent via SMS',
    },
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'book-1',
    propertyId: 'prop-1',
    propertyName: 'Beachfront Villa',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@email.com',
    guestPhone: '+1-555-0123',
    checkIn: new Date('2025-01-28'),
    checkOut: new Date('2025-02-02'),
    nights: 5,
    guests: 4,
    platform: 'Airbnb',
    reservationStatus: 'Confirmed',
    paymentStatus: 'Paid',
    totalAmount: 2500,
    paidAmount: 2500,
  },
  {
    id: 'book-2',
    propertyId: 'prop-2',
    propertyName: 'Downtown Loft',
    guestName: 'Michael Chen',
    guestEmail: 'mchen@email.com',
    guestPhone: '+1-555-0456',
    checkIn: new Date('2025-02-01'),
    checkOut: new Date('2025-02-05'),
    nights: 4,
    guests: 2,
    platform: 'Vrbo',
    reservationStatus: 'Confirmed',
    paymentStatus: 'Partial',
    totalAmount: 1600,
    paidAmount: 800,
  },
  {
    id: 'book-3',
    propertyId: 'prop-1',
    propertyName: 'Beachfront Villa',
    guestName: 'Emily Rodriguez',
    guestEmail: 'emily.r@email.com',
    guestPhone: '+1-555-0789',
    checkIn: new Date('2025-02-10'),
    checkOut: new Date('2025-02-17'),
    nights: 7,
    guests: 6,
    platform: 'Direct',
    reservationStatus: 'Reserved',
    paymentStatus: 'Unpaid',
    totalAmount: 3500,
    paidAmount: 0,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    guestName: 'Sarah Johnson',
    lastMessage: 'Thank you for the quick response!',
    timestamp: new Date('2025-01-27T16:30:00'),
    unreadCount: 0,
    bookingId: 'book-1',
    platform: 'Airbnb',
  },
  {
    id: 'conv-2',
    guestName: 'Michael Chen',
    lastMessage: 'What time is check-in?',
    timestamp: new Date('2025-01-27T14:15:00'),
    unreadCount: 2,
    bookingId: 'book-2',
    platform: 'Vrbo',
  },
];

export const mockCrews: Crew[] = [
  {
    id: 'crew-1',
    name: 'Premium Clean Co.',
    email: 'contact@premiumclean.com',
    phone: '+1-555-1000',
    specialties: ['Cleaning'],
    tasksAssigned: 15,
    tasksCompleted: 12,
  },
  {
    id: 'crew-2',
    name: 'Support Team',
    email: 'support@strmanager.com',
    phone: '+1-555-2000',
    specialties: ['Guest Issue'],
    tasksAssigned: 28,
    tasksCompleted: 25,
  },
  {
    id: 'crew-3',
    name: 'Fix-It Pros',
    email: 'service@fixitpros.com',
    phone: '+1-555-3000',
    specialties: ['Maintenance'],
    tasksAssigned: 8,
    tasksCompleted: 7,
  },
];

export const mockKPIs: KPI[] = [
  {
    label: 'Occupancy Rate',
    value: '87%',
    change: 5,
    changeLabel: 'vs last month',
    trend: 'up',
  },
  {
    label: 'Revenue (MTD)',
    value: '$45,320',
    change: 12,
    changeLabel: 'vs last month',
    trend: 'up',
  },
  {
    label: 'Avg Nightly Rate',
    value: '$285',
    change: -3,
    changeLabel: 'vs last month',
    trend: 'down',
  },
  {
    label: 'Active Bookings',
    value: 23,
    change: 0,
    changeLabel: 'this week',
    trend: 'neutral',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'error',
    title: 'Sync Failed',
    message: 'Downtown Loft (Airbnb) failed to sync. Check API connection.',
    timestamp: new Date('2025-01-27T09:00:00'),
    isRead: false,
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Payment Overdue',
    message: 'Booking #book-3 payment is overdue by 2 days.',
    timestamp: new Date('2025-01-26T14:00:00'),
    isRead: false,
  },
];

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Welcome Message on Booking',
    triggerEvent: 'NewBooking',
    condition: 'reservationStatus === "Confirmed"',
    action: 'SendMessage',
    actionDetails: 'Send welcome template',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    lastExecuted: new Date('2025-01-27T10:00:00'),
  },
  {
    id: 'rule-2',
    name: 'Create Cleaning Task on Checkout',
    triggerEvent: 'CheckOut',
    condition: 'always',
    action: 'CreateTask',
    actionDetails: 'Priority P2, Type Cleaning',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    lastExecuted: new Date('2025-01-26T11:00:00'),
  },
];

export const mockExecutionLogs: ExecutionLog[] = [
  {
    id: 'log-1',
    ruleId: 'rule-1',
    ruleName: 'Welcome Message on Booking',
    timestamp: new Date('2025-01-27T10:00:00'),
    outcome: 'Success',
    affectedBookingId: 'book-1',
    details: 'Welcome message sent to Sarah Johnson',
  },
  {
    id: 'log-2',
    ruleId: 'rule-2',
    ruleName: 'Create Cleaning Task on Checkout',
    timestamp: new Date('2025-01-26T11:00:00'),
    outcome: 'Success',
    details: 'Cleaning task created for Beachfront Villa',
  },
  {
    id: 'log-3',
    ruleId: 'rule-1',
    ruleName: 'Welcome Message on Booking',
    timestamp: new Date('2025-01-25T14:30:00'),
    outcome: 'Failed',
    affectedBookingId: 'book-2',
    details: 'Email service unavailable',
  },
];
