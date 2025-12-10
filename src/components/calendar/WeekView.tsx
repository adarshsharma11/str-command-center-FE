import { useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isWithinInterval,
  differenceInDays,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { CalendarBooking, VendorTask, ColorAssignment } from './types';
import { BookingBlock } from './BookingBlock';
import { VendorTaskTag } from './VendorTaskTag';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  date: Date;
  bookings: CalendarBooking[];
  tasks: VendorTask[];
  colorAssignments: ColorAssignment[];
  onBookingClick: (booking: CalendarBooking) => void;
  onTaskClick: (task: VendorTask) => void;
}

export function WeekView({
  date,
  bookings,
  tasks,
  colorAssignments,
  onBookingClick,
  onTaskClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const getPropertyColor = (propertyId: string) => {
    const assignment = colorAssignments.find(
      (a) => a.category === 'property' && a.id === propertyId
    );
    return assignment?.color || '#6B7280';
  };

  // Group bookings by property for spanning visualization
  const bookingRows = useMemo(() => {
    const relevantBookings = bookings.filter((b) => {
      return weekDays.some((day) =>
        isWithinInterval(day, { start: startOfDay(b.checkIn), end: endOfDay(b.checkOut) })
      );
    });

    // Group by property
    const byProperty: Record<string, CalendarBooking[]> = {};
    relevantBookings.forEach((b) => {
      if (!byProperty[b.propertyId]) {
        byProperty[b.propertyId] = [];
      }
      byProperty[b.propertyId].push(b);
    });

    return byProperty;
  }, [bookings, weekDays]);

  // Get tasks for each day
  const getTasksForDay = (day: Date) => {
    return tasks.filter((t) => isSameDay(t.scheduledTime, day));
  };

  // Calculate booking span position
  const getBookingSpan = (booking: CalendarBooking) => {
    const startIdx = weekDays.findIndex((d) => 
      isSameDay(d, booking.checkIn) || d > booking.checkIn
    );
    const endIdx = weekDays.findIndex((d) => 
      isSameDay(d, booking.checkOut) || d > booking.checkOut
    );
    
    const adjustedStart = Math.max(0, startIdx === -1 ? 0 : startIdx);
    const adjustedEnd = endIdx === -1 ? 7 : Math.min(7, endIdx + 1);
    
    return {
      start: adjustedStart,
      span: adjustedEnd - adjustedStart,
      startsThisWeek: startIdx >= 0,
      endsThisWeek: endIdx >= 0 && endIdx < 7,
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-border bg-card">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'p-3 text-center border-r border-border last:border-r-0',
              isSameDay(day, today) && 'bg-primary/5'
            )}
          >
            <p className="text-xs text-muted-foreground uppercase">
              {format(day, 'EEE')}
            </p>
            <p
              className={cn(
                'text-lg font-semibold mt-1',
                isSameDay(day, today)
                  ? 'text-primary'
                  : 'text-foreground'
              )}
            >
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Booking Rows */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {Object.entries(bookingRows).map(([propertyId, propertyBookings]) => (
            <div key={propertyId} className="relative">
              {/* Property Label */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-muted/50 border-r border-border p-2 z-10">
                <p className="text-xs font-medium text-foreground truncate">
                  {propertyBookings[0]?.propertyName}
                </p>
              </div>

              {/* Booking Spans */}
              <div className="ml-32 relative min-h-[80px]">
                <div className="grid grid-cols-7 absolute inset-0">
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'border-r border-border/30 last:border-r-0',
                        isSameDay(day, today) && 'bg-primary/5'
                      )}
                    />
                  ))}
                </div>

                <div className="relative p-2 space-y-1">
                  {propertyBookings.map((booking) => {
                    const { start, span, startsThisWeek, endsThisWeek } = getBookingSpan(booking);
                    const color = getPropertyColor(booking.propertyId);

                    return (
                      <div
                        key={booking.id}
                        className="relative"
                        style={{
                          marginLeft: `${(start / 7) * 100}%`,
                          width: `${(span / 7) * 100}%`,
                        }}
                      >
                        <div
                          onClick={() => onBookingClick(booking)}
                          className={cn(
                            'p-2 cursor-pointer transition-all hover:shadow-md',
                            startsThisWeek ? 'rounded-l-lg' : '',
                            endsThisWeek ? 'rounded-r-lg' : ''
                          )}
                          style={{
                            backgroundColor: `${color}25`,
                            borderLeft: startsThisWeek ? `4px solid ${color}` : undefined,
                          }}
                        >
                          <p className="text-sm font-medium truncate text-foreground">
                            {booking.status === 'blocked' ? '🚫 Blocked' : booking.guestName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {startsThisWeek && (
                              <span className="text-emerald-600">
                                In: {format(booking.checkIn, 'ha')}
                              </span>
                            )}
                            {endsThisWeek && (
                              <span className="text-red-500">
                                Out: {format(booking.checkOut, 'ha')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Tasks Row */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-muted/50 border-r border-border p-2 z-10">
              <p className="text-xs font-medium text-muted-foreground">Tasks</p>
            </div>

            <div className="ml-32 grid grid-cols-7 min-h-[100px]">
              {weekDays.map((day) => {
                const dayTasks = getTasksForDay(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'border-r border-border/30 last:border-r-0 p-2',
                      isSameDay(day, today) && 'bg-primary/5'
                    )}
                  >
                    <div className="space-y-1">
                      {dayTasks.slice(0, 4).map((task) => (
                        <VendorTaskTag
                          key={task.id}
                          task={task}
                          compact
                          onClick={() => onTaskClick(task)}
                        />
                      ))}
                      {dayTasks.length > 4 && (
                        <p className="text-xs text-muted-foreground">
                          +{dayTasks.length - 4} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {Object.keys(bookingRows).length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No bookings this week
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
