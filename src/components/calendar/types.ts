export type CalendarView = 'day' | 'week' | 'month' | 'year';

export type ColorCategory = 'property' | 'channel' | 'crew' | 'taskType';

export interface ColorAssignment {
  id: string;
  category: ColorCategory;
  name: string;
  color: string;
}

export interface CalendarBooking {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  channel: 'airbnb' | 'vrbo' | 'direct' | 'booking';
  status: 'confirmed' | 'pending' | 'blocked';
  paymentStatus?: 'paid' | 'partial' | 'unpaid' | 'pending';
  guestNotes?: string;
  guestCount?: number;
  guestEmail?: string;
  guestPhone?: string;
  totalAmount?: number;
  notes?: string;
}

export interface VendorTask {
  id: string;
  bookingId?: string;
  propertyId: string;
  type: 'cleaning' | 'chef' | 'bartender' | 'massage' | 'handyman' | 'concierge';
  vendorName: string;
  scheduledTime: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'in-progress' | 'completed';
  notes?: string;
  propertyName?: string;
}

export interface CalendarEvent {
  id: string;
  type: 'booking' | 'task' | 'block';
  data: CalendarBooking | VendorTask;
}

// Color presets for the picker
export const colorPresets = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Purple
];

export const channelColors: Record<string, string> = {
  airbnb: '#FF5A5F',
  vrbo: '#3D5A80',
  direct: '#10B981',
  booking: '#003580',
};

export const taskTypeColors: Record<string, string> = {
  cleaning: '#F59E0B',
  chef: '#EF4444',
  bartender: '#8B5CF6',
  massage: '#EC4899',
  handyman: '#6366F1',
  concierge: '#06B6D4',
};
