import { useState, useCallback, useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, eachMonthOfInterval, eachDayOfInterval, format, isSameDay, subMonths, addMonths } from 'date-fns';
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
} from '@/components/calendar/mockCalendarData';
import { useCalendarBookingsQuery } from '@/lib/api/booking';
import { usePropertiesQuery } from '@/lib/api/property';
import { useServiceCategoriesQuery } from '@/lib/api/service-category';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { env } from '@/config/env';
import { getToken } from '@/lib/auth/token';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CalendarPageSkeleton } from '@/components/skeletons/CalendarSkeleton';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [colorAssignments, setColorAssignments] = useState<ColorAssignment[]>(mockColorAssignments);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  
  // Add Task Modal State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskType, setTaskType] = useState<string>('cleaning');
  const [serviceId, setServiceId] = useState<string>('');
  const [taskDate, setTaskDate] = useState<string>('');
  const [taskTime, setTaskTime] = useState<string>('10:00');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskLogs, setTaskLogs] = useState<string[]>([]);

  // Fetch bookings from API with larger limit for calendar view
  // Fetch for the full system to ensure metrics are accurate
  // Use a very large limit (10000) when in Year view, else 1000
  const { data: bookingsData, isLoading: isLoadingBookings, error: bookingsError, refetch: refetchBookings } = useCalendarBookingsQuery(
    1, 
    currentView === 'year' ? 10000 : 1000
  );
  
  // Fetch properties from API
  const { data: propertiesData, isLoading: isLoadingProperties, error: propertiesError } = usePropertiesQuery(1, 50);
  
  // Fetch service categories
  const { data: serviceCategoriesData, isLoading: isLoadingServiceCategories } = useServiceCategoriesQuery();
  const serviceCategories = serviceCategoriesData?.data || [];
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

  // Transform properties from API
  const properties = useMemo(() => {
    if (!propertiesData?.data) return [];
    const items = Array.isArray(propertiesData.data) ? propertiesData.data : [];
    return items.map(property => ({
      id: String(property.id),
      name: property.name || `Property ${property.id}`,
    }));
  }, [propertiesData]);

  // Calculate monthly occupancy and revenue for Year View
  const monthlyStats = useMemo(() => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    const occupancy: Record<string, number> = {};
    const revenue: Record<string, number> = {};
    
    // Match Dashboard logic: Identify all properties that have at least one booking in the system
    const activeInSystemPropertyIds = Array.from(new Set(apiBookings.map(b => b.propertyId)));

    months.forEach(month => {
      const monthKey = format(month, 'yyyy-MM');
      const daysInMonth = eachDayOfInterval({ 
        start: startOfMonth(month), 
        end: endOfMonth(month) 
      });
      
      // Dashboard uses (end - start).days for the period.
      // For a full month, this is (number of days - 1). e.g., March 1 to March 31 is 30 days.
      const daysInRange = daysInMonth.length - 1;
      
      let monthBookedNights = 0;
      let monthRevenue = 0;
      const activePropertiesInMonth = new Set<string>();

      apiBookings.forEach(booking => {
        // Only count confirmed and pending bookings for occupancy
        if (booking.status === 'blocked') return;

        const checkIn = new Date(booking.checkIn);
        
        // Match Dashboard logic: Process bookings that start in this month
        if (format(checkIn, 'yyyy-MM') === monthKey) {
          monthBookedNights += booking.nights || 0;
          monthRevenue += booking.totalAmount || 0;
          activePropertiesInMonth.add(booking.propertyId);
        }
      });

      // Match Dashboard Logic:
      // Overall Occupancy = (Total Booked Nights) / (Days in Period * Number of Properties)
      if (selectedProperty === 'all') {
        // Dashboard uses the count of properties that had bookings in the range
        const numProperties = Math.max(activePropertiesInMonth.size, 1);
        const availableNights = daysInRange * numProperties;
        
        occupancy[monthKey] = availableNights > 0 
          ? Math.round((monthBookedNights / availableNights) * 100 * 10) / 10 
          : 0;
      } else {
        // Individual property view
        const propertyBookedNights = apiBookings
          .filter(b => b.propertyId === selectedProperty && b.status !== 'blocked' && format(new Date(b.checkIn), 'yyyy-MM') === monthKey)
          .reduce((sum, b) => sum + (b.nights || 0), 0);
          
        const availableNights = daysInRange; // 1 property
        occupancy[monthKey] = availableNights > 0 
          ? Math.round((propertyBookedNights / availableNights) * 100 * 10) / 10 
          : 0;
      }

      revenue[monthKey] = monthRevenue;
    });

    return { occupancy, revenue };
  }, [currentDate, allBookings, properties, selectedProperty]);

  const tasks = useMemo(() => {
    return allTasks.filter((task) => {
      const taskDate = new Date(task.scheduledTime);
      return isWithinInterval(taskDate, getViewDateRange);
    });
  }, [allTasks, getViewDateRange]);

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

  const handleOpenAddTask = useCallback((booking: CalendarBooking) => {
    setSelectedBooking(booking);
    setTaskDate(format(new Date(booking.checkOut), 'yyyy-MM-dd'));
    setTaskType('cleaning');
    setServiceId('');
    setTaskLogs([]);
    setIsAddTaskOpen(true);
  }, []);

  const handleSaveTask = async () => {
    if (!selectedBooking) return;
    
    setIsAddingTask(true);
    setTaskLogs(['Starting task creation process...']);
    
    try {
      const token = getToken();
      
      const payload = {
        reservation_id: selectedBooking.id,
        type: taskType,
        service_id: taskType === 'service' ? parseInt(serviceId) : undefined,
        service_date: taskDate,
        service_time: taskTime
      };

      const response = await fetch(`${env.apiBaseUrl}${ENDPOINTS.SERVICE_BOOKINGS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            setTaskLogs(prev => [...prev, data.message || `Step ${data.step} ${data.status}`]);
            
            if (data.step === 'complete' && data.status === 'success') {
              toast.success('Task created successfully');
              refetchBookings();
              // Keep logs visible for a moment then close
              setTimeout(() => {
                setIsAddTaskOpen(false);
                setIsAddingTask(false);
              }, 2000);
            }
          } catch (e) {
            console.error('Error parsing NDJSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add task');
      setIsAddingTask(false);
    }
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
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <p className="text-destructive font-medium">Failed to load calendar data</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
                  tasks={tasks}
                  colorAssignments={colorAssignments}
                  colorBy="property"
                  onBookingClick={handleBookingClick}
                  onTaskClick={handleTaskClick}
                  onDayClick={handleDayClick}
                />
              )}

              {currentView === 'year' && (
                <YearView
                  date={currentDate}
                  bookings={bookings}
                  occupancyData={monthlyStats.occupancy}
                  revenueData={monthlyStats.revenue}
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
            onAddTask={handleOpenAddTask}
          />
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task for {selectedBooking?.guestName}</DialogTitle>
            <DialogDescription>
              Schedule a cleaning or additional service for this booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning Task</SelectItem>
                  <SelectItem value="service">Additional Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {taskType === 'service' && (
              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.category_name} {cat.price ? `- $${cat.price}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={taskDate} 
                  onChange={(e) => setTaskDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input 
                  type="time" 
                  value={taskTime} 
                  onChange={(e) => setTaskTime(e.target.value)} 
                />
              </div>
            </div>

            {taskLogs.length > 0 && (
              <div className="bg-muted p-3 rounded-md text-xs font-mono max-h-40 overflow-y-auto space-y-1">
                {taskLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground">[{i+1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)} disabled={isAddingTask}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTask} 
              disabled={isAddingTask || (taskType === 'service' && !serviceId)}
            >
              {isAddingTask ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add & Notify'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
