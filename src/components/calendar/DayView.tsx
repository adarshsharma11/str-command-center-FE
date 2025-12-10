import { useMemo } from 'react';
import { format, isSameDay, setHours, getHours, getMinutes } from 'date-fns';
import { CalendarBooking, VendorTask, ColorAssignment } from './types';
import { BookingBlock } from './BookingBlock';
import { VendorTaskTag } from './VendorTaskTag';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DayViewProps {
  date: Date;
  bookings: CalendarBooking[];
  tasks: VendorTask[];
  colorAssignments: ColorAssignment[];
  onBookingClick: (booking: CalendarBooking) => void;
  onTaskClick: (task: VendorTask) => void;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export function DayView({
  date,
  bookings,
  tasks,
  colorAssignments,
  onBookingClick,
  onTaskClick,
}: DayViewProps) {
  // Filter events for this day
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const checkInDay = isSameDay(b.checkIn, date);
      const checkOutDay = isSameDay(b.checkOut, date);
      const spans = b.checkIn <= date && b.checkOut >= date;
      return checkInDay || checkOutDay || spans;
    });
  }, [bookings, date]);

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => isSameDay(t.scheduledTime, date));
  }, [tasks, date]);

  const getPropertyColor = (propertyId: string) => {
    const assignment = colorAssignments.find(
      (a) => a.category === 'property' && a.id === propertyId
    );
    return assignment?.color || '#6B7280';
  };

  const getTaskPosition = (task: VendorTask) => {
    const hour = getHours(task.scheduledTime);
    const minutes = getMinutes(task.scheduledTime);
    const top = (hour + minutes / 60) * 60; // 60px per hour
    const height = (task.duration / 60) * 60;
    return { top, height };
  };

  // Check-ins and check-outs for this day
  const checkIns = dayBookings.filter((b) => isSameDay(b.checkIn, date));
  const checkOuts = dayBookings.filter((b) => isSameDay(b.checkOut, date));

  return (
    <div className="flex flex-col h-full">
      {/* Day Header */}
      <div className="border-b border-border p-4 bg-card">
        <h2 className="text-xl font-semibold text-foreground">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-emerald-600 font-medium">
            {checkIns.length} check-in{checkIns.length !== 1 ? 's' : ''}
          </span>
          <span className="text-red-500 font-medium">
            {checkOuts.length} check-out{checkOuts.length !== 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">
            {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      {(checkIns.length > 0 || checkOuts.length > 0) && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-ins */}
            {checkIns.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Check-ins Today
                </h3>
                <div className="space-y-2">
                  {checkIns.map((booking) => (
                    <BookingBlock
                      key={booking.id}
                      booking={booking}
                      propertyColor={getPropertyColor(booking.propertyId)}
                      variant="compact"
                      onClick={() => onBookingClick(booking)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Check-outs */}
            {checkOuts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Check-outs Today
                </h3>
                <div className="space-y-2">
                  {checkOuts.map((booking) => (
                    <BookingBlock
                      key={booking.id}
                      booking={booking}
                      propertyColor={getPropertyColor(booking.propertyId)}
                      variant="compact"
                      onClick={() => onBookingClick(booking)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Grid */}
      <ScrollArea className="flex-1">
        <div className="relative min-h-[1440px]"> {/* 24 hours * 60px */}
          {/* Hour Lines */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full border-t border-border/50 flex"
              style={{ top: hour * 60 }}
            >
              <div className="w-16 pr-2 text-right text-xs text-muted-foreground -mt-2">
                {format(setHours(new Date(), hour), 'h a')}
              </div>
              <div className="flex-1 h-[60px]" />
            </div>
          ))}

          {/* Tasks */}
          <div className="absolute left-16 right-4 top-0">
            {dayTasks.map((task) => {
              const { top, height } = getTaskPosition(task);
              return (
                <div
                  key={task.id}
                  className="absolute left-0 right-0 p-1"
                  style={{ top, height: Math.max(height, 30) }}
                >
                  <div
                    className="h-full rounded-lg p-2 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => onTaskClick(task)}
                    style={{
                      backgroundColor: `${getPropertyColor(task.propertyId)}15`,
                      borderLeft: `3px solid ${getPropertyColor(task.propertyId)}`,
                    }}
                  >
                    <VendorTaskTag task={task} />
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {/* TODO: integrate property lookup */}
                      Property Task
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
