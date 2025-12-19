import { useState, useCallback, useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { Layout } from '@/components/Layout';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { YearView } from '@/components/calendar/YearView';
import { CalendarSidePanel } from '@/components/calendar/CalendarSidePanel';
import { EventCardList } from '@/components/calendar/EventCardList';
import { 
  CalendarView, 
  CalendarBooking, 
  VendorTask, 
  ColorAssignment 
} from '@/components/calendar/types';
import { 
  mockColorAssignments,
  mockOccupancyData,
} from '@/components/calendar/mockCalendarData';
import { useCalendarBookingsQuery } from '@/lib/api/booking';
import { usePropertiesQuery } from '@/lib/api/property';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { CalendarPageSkeleton } from '@/components/skeletons/CalendarSkeleton';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [colorAssignments, setColorAssignments] = useState<ColorAssignment[]>(mockColorAssignments);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Fetch bookings from API with larger limit for calendar view
  const { data: bookingsData, isLoading: isLoadingBookings, error: bookingsError } = useCalendarBookingsQuery(1, 100);
  
  // Fetch properties from API
  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = usePropertiesQuery(1, 50);

  // Transform API bookings to calendar format
  const apiBookings = useMemo(() => {
    if (!bookingsData?.bookings) return [];
    return bookingsData.bookings;
  }, [bookingsData]);

  // Extract vendor tasks from API response
  const apiTasks = useMemo(() => {
    if (!bookingsData?.vendorTasks) return [];
    return bookingsData.vendorTasks;
  }, [bookingsData]);

  // Filter bookings by selected property
  const allBookings = useMemo(() => {
    return selectedProperty === 'all' 
      ? apiBookings 
      : apiBookings.filter(b => b.propertyId === selectedProperty);
  }, [apiBookings, selectedProperty]);

  // Use vendor tasks from API
  const allTasks = selectedProperty === 'all'
    ? apiTasks
    : apiTasks.filter(t => t.propertyId === selectedProperty);

  // Get the date range for the current view
  const getViewDateRange = useMemo(() => {
    switch (currentView) {
      case 'day':
        return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
      case 'week':
        return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'year':
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
      default:
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  }, [currentDate, currentView]);

  // Filter bookings and tasks for the current view
  const bookings = useMemo(() => {
    return allBookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return (
        isWithinInterval(checkIn, getViewDateRange) ||
        isWithinInterval(checkOut, getViewDateRange) ||
        (checkIn <= getViewDateRange.start && checkOut >= getViewDateRange.end)
      );
    });
  }, [allBookings, getViewDateRange]);

  const tasks = useMemo(() => {
    return allTasks.filter((task) => {
      const taskDate = new Date(task.scheduledTime);
      return isWithinInterval(taskDate, getViewDateRange);
    });
  }, [allTasks, getViewDateRange]);

  // Transform properties from API
  const properties = useMemo(() => {
    if (!propertiesData?.data?.data) return [];
    return propertiesData.data.data.map(property => ({
      id: String(property.id),
      name: property.name || `Property ${property.id}`,
    }));
  }, [propertiesData]);

  const handleBookingClick = useCallback((booking: CalendarBooking) => {
    setSelectedBooking(booking);
  }, []);

  const handleTaskClick = useCallback((task: VendorTask) => {
    // TODO: implement task detail panel
    toast.info(`Task: ${task.vendorName} - ${task.type}`);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
  }, []);

  const handleMonthClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setCurrentView('month');
  }, []);

  const handleAddEvent = () => {
    setShowAddEvent(true);
  };

  const handleSaveEvent = () => {
    // TODO: integrate event creation API
    toast.success('Event created successfully');
    setShowAddEvent(false);
  };

  // Handle loading and error states
  if (isLoadingBookings || isLoadingProperties) {
    return (
      <Layout>
        <CalendarPageSkeleton />
      </Layout>
    );
  }

  if (bookingsError || propertiesError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading calendar data</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {/* Header */}
            <CalendarHeader
              currentDate={currentDate}
              currentView={currentView}
              colorAssignments={colorAssignments}
              selectedProperty={selectedProperty}
              properties={properties}
              onDateChange={setCurrentDate}
              onViewChange={setCurrentView}
              onColorAssignmentsChange={setColorAssignments}
              onPropertyChange={setSelectedProperty}
              onAddEvent={handleAddEvent}
            />

            {/* Calendar View */}
            <div className="bg-background min-h-[400px]">
              {currentView === 'day' && (
                <DayView
                  date={currentDate}
                  bookings={bookings}
                  tasks={tasks}
                  colorAssignments={colorAssignments}
                  onBookingClick={handleBookingClick}
                  onTaskClick={handleTaskClick}
                />
              )}

              {currentView === 'week' && (
                <WeekView
                  date={currentDate}
                  bookings={bookings}
                  tasks={tasks}
                  colorAssignments={colorAssignments}
                  onBookingClick={handleBookingClick}
                  onTaskClick={handleTaskClick}
                />
              )}

              {currentView === 'month' && (
                <MonthView
                  date={currentDate}
                  bookings={bookings}
                  colorAssignments={colorAssignments}
                  colorBy="property"
                  onBookingClick={handleBookingClick}
                  onDayClick={handleDayClick}
                />
              )}

              {currentView === 'year' && (
                <YearView
                  date={currentDate}
                  bookings={bookings}
                  occupancyData={mockOccupancyData}
                  onMonthClick={handleMonthClick}
                />
              )}
            </div>

            {/* Event Cards List */}
            <div className="p-6 border-t border-border">
              <EventCardList
                bookings={bookings}
                tasks={tasks}
                colorAssignments={colorAssignments}
                onBookingClick={handleBookingClick}
                onTaskClick={handleTaskClick}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Side Panel */}
        {selectedBooking && (
          <CalendarSidePanel
            booking={selectedBooking}
            tasks={tasks}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select defaultValue="booking">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="task">Vendor Task</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Property</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Guest Name (optional)</Label>
              <Input placeholder="Guest name" />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Add any notes..." />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                Save Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
