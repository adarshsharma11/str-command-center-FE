import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { CalendarBooking, ColorAssignment, channelColors } from './types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MonthViewProps {
  date: Date;
  bookings: CalendarBooking[];
  colorAssignments: ColorAssignment[];
  colorBy: 'property' | 'channel';
  onBookingClick: (booking: CalendarBooking) => void;
  onDayClick: (date: Date) => void;
}

export function MonthView({
  date,
  bookings,
  colorAssignments,
  colorBy,
  onBookingClick,
  onDayClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const today = new Date();

  // Generate all days in the calendar view
  const days = useMemo(() => {
    const result: Date[] = [];
    let current = calendarStart;
    while (current <= calendarEnd) {
      result.push(current);
      current = addDays(current, 1);
    }
    return result;
  }, [calendarStart, calendarEnd]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const getColor = (booking: CalendarBooking) => {
    if (colorBy === 'channel') {
      return channelColors[booking.channel] || '#6B7280';
    }
    const assignment = colorAssignments.find(
      (a) => a.category === 'property' && a.id === booking.propertyId
    );
    return assignment?.color || '#6B7280';
  };

  // Get bookings for a specific day
  const getBookingsForDay = (day: Date) => {
    return bookings.filter((b) =>
      isWithinInterval(day, {
        start: startOfDay(b.checkIn),
        end: endOfDay(b.checkOut),
      })
    );
  };

  // Check if booking starts/ends on this day
  const getBookingDayType = (booking: CalendarBooking, day: Date) => {
    const isStart = isSameDay(booking.checkIn, day);
    const isEnd = isSameDay(booking.checkOut, day);
    return { isStart, isEnd };
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden">
      {/* Month Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">
          {format(date, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-muted-foreground uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(100px,1fr))]">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const isToday = isSameDay(day, today);
              const isCurrentMonth = isSameMonth(day, date);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onDayClick(day)}
                  className={cn(
                    'min-h-[100px] p-1 border-r border-border last:border-r-0 cursor-pointer transition-colors',
                    'hover:bg-muted/50',
                    !isCurrentMonth && 'bg-muted/20',
                    isToday && 'bg-primary/5'
                  )}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                        isToday && 'bg-primary text-primary-foreground',
                        !isCurrentMonth && 'text-muted-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Booking Bars */}
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((booking) => {
                      const { isStart, isEnd } = getBookingDayType(booking, day);
                      const color = getColor(booking);

                      return (
                        <TooltipProvider key={booking.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onBookingClick(booking);
                                }}
                                className={cn(
                                  'h-5 cursor-pointer transition-all hover:scale-y-110',
                                  isStart && 'rounded-l-md ml-0.5',
                                  isEnd && 'rounded-r-md mr-0.5',
                                  !isStart && !isEnd && 'mx-0'
                                )}
                                style={{
                                  backgroundColor: `${color}${booking.status === 'blocked' ? '40' : '60'}`,
                                  borderLeft: isStart ? `3px solid ${color}` : undefined,
                                }}
                              >
                                {isStart && (
                                  <p
                                    className="text-[10px] font-medium truncate px-1 leading-5"
                                    style={{ color }}
                                  >
                                    {booking.status === 'blocked' ? '🚫' : booking.guestName}
                                  </p>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="space-y-1">
                                <p className="font-medium">{booking.propertyName}</p>
                                {booking.status !== 'blocked' && (
                                  <p className="text-sm">{booking.guestName}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {format(booking.checkIn, 'MMM d')} - {format(booking.checkOut, 'MMM d')}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{dayBookings.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
