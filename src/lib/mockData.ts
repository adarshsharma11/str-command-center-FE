// Mock data for development - TODO: Replace with Supabase queries

import type { 
  Property, Listing, Task, Booking, Message, Conversation, 
  Crew, KPI, Alert, AutomationRule, ExecutionLog, Service, LocationStats,
  CrewFolder, CrewMember, CalendarEvent, EventCategoryConfig
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
    label: 'Total Revenue',
    value: '$128,450',
    change: 18,
    changeLabel: 'vs last month',
    trend: 'up',
  },
  {
    label: 'Property Revenue',
    value: '$89,320',
    change: 12,
    changeLabel: 'vs last month',
    trend: 'up',
  },
  {
    label: 'Services Revenue',
    value: '$39,130',
    change: 28,
    changeLabel: 'vs last month',
    trend: 'up',
  },
  {
    label: 'Active Bookings',
    value: 23,
    change: 3,
    changeLabel: 'this week',
    trend: 'up',
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

export const mockServices: Service[] = [
  {
    id: 'srv-1',
    type: 'Private Chef',
    bookingId: 'book-1',
    propertyId: 'prop-1',
    guestName: 'Sarah Johnson',
    date: new Date('2025-01-29T19:00:00'),
    price: 850,
    status: 'Scheduled',
  },
  {
    id: 'srv-2',
    type: 'Massage',
    bookingId: 'book-1',
    propertyId: 'prop-1',
    guestName: 'Sarah Johnson',
    date: new Date('2025-01-30T15:00:00'),
    price: 200,
    status: 'Scheduled',
  },
  {
    id: 'srv-3',
    type: 'Bartender',
    bookingId: 'book-3',
    propertyId: 'prop-1',
    guestName: 'Emily Rodriguez',
    date: new Date('2025-02-11T18:00:00'),
    price: 450,
    status: 'Scheduled',
  },
  {
    id: 'srv-4',
    type: 'Transportation',
    bookingId: 'book-2',
    propertyId: 'prop-2',
    guestName: 'Michael Chen',
    date: new Date('2025-02-01T10:00:00'),
    price: 150,
    status: 'Completed',
  },
];

export const mockLocationStats: LocationStats[] = [
  { region: 'North America', bookings: 45, revenue: 67500, percentage: 42 },
  { region: 'Europe', bookings: 32, revenue: 52000, percentage: 30 },
  { region: 'Asia', bookings: 18, revenue: 28800, percentage: 17 },
  { region: 'South America', bookings: 8, revenue: 12800, percentage: 7 },
  { region: 'Other', bookings: 4, revenue: 6400, percentage: 4 },
];

export const mockCrewFolders: CrewFolder[] = [
  {
    id: 'folder-1',
    name: 'Property Services',
    parentId: null,
    order: 0,
    members: [],
  },
  {
    id: 'folder-1-1',
    name: 'Cleaning Teams',
    parentId: 'folder-1',
    order: 0,
    members: [
      {
        id: 'member-1',
        name: 'Premium Clean Co.',
        role: 'Lead Cleaning',
        order: 0,
        contactInfo: { email: 'contact@premiumclean.com', phone: '+1-555-1000' },
      },
      {
        id: 'member-2',
        name: 'Express Cleaners',
        role: 'Backup Cleaning',
        order: 1,
        contactInfo: { email: 'info@expressclean.com', phone: '+1-555-1001' },
      },
    ],
  },
  {
    id: 'folder-1-2',
    name: 'Maintenance',
    parentId: 'folder-1',
    order: 1,
    members: [
      {
        id: 'member-3',
        name: 'Fix-It Pros',
        role: 'General Maintenance',
        order: 0,
        contactInfo: { email: 'service@fixitpros.com', phone: '+1-555-3000' },
      },
    ],
  },
  {
    id: 'folder-2',
    name: 'Luxury Services',
    parentId: null,
    order: 1,
    members: [],
  },
  {
    id: 'folder-2-1',
    name: 'Culinary',
    parentId: 'folder-2',
    order: 0,
    members: [
      {
        id: 'member-4',
        name: 'Chef Michael Laurent',
        role: 'Private Chef',
        order: 0,
        contactInfo: { email: 'chef@laurent.com', phone: '+1-555-4000' },
      },
      {
        id: 'member-5',
        name: 'Mixology Masters',
        role: 'Bartender Service',
        order: 1,
        contactInfo: { email: 'events@mixology.com', phone: '+1-555-4001' },
      },
    ],
  },
  {
    id: 'folder-2-2',
    name: 'Wellness',
    parentId: 'folder-2',
    order: 1,
    members: [
      {
        id: 'member-6',
        name: 'Serenity Spa',
        role: 'Massage Therapy',
        order: 0,
        contactInfo: { email: 'booking@serenityspa.com', phone: '+1-555-5000' },
      },
    ],
  },
  {
    id: 'folder-3',
    name: 'Guest Support',
    parentId: null,
    order: 2,
    members: [
      {
        id: 'member-7',
        name: 'Concierge Team',
        role: 'Guest Relations',
        order: 0,
        contactInfo: { email: 'concierge@luxury.com', phone: '+1-555-6000' },
      },
    ],
  },
];

export const mockCalendarEvents: CalendarEvent[] = [
  ...mockBookings.map(b => ({
    id: `event-booking-${b.id}`,
    title: `${b.guestName} - ${b.propertyName}`,
    category: 'Reservation' as const,
    propertyId: b.propertyId,
    startDate: b.checkIn,
    endDate: b.checkOut,
    description: `${b.nights} nights, ${b.guests} guests`,
  })),
  {
    id: 'event-maint-1',
    title: 'HVAC Inspection',
    category: 'Maintenance',
    propertyId: 'prop-2',
    startDate: new Date('2025-02-08'),
    endDate: new Date('2025-02-08'),
    description: 'Annual HVAC system check',
  },
];

export const defaultEventCategories: EventCategoryConfig[] = [
  { category: 'Reservation', color: 'hsl(142, 76%, 36%)', label: 'Reservation' },
  { category: 'Maintenance', color: 'hsl(24, 95%, 53%)', label: 'Maintenance' },
  { category: 'Service', color: 'hsl(262, 83%, 58%)', label: 'Service' },
  { category: 'Blocked', color: 'hsl(0, 0%, 45%)', label: 'Blocked' },
  { category: 'Personal', color: 'hsl(199, 89%, 48%)', label: 'Personal' },
];
