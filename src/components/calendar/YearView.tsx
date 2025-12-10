import { useMemo } from 'react';
import {
  format,
  startOfYear,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { CalendarBooking } from './types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface YearViewProps {
  date: Date;
  bookings: CalendarBooking[];
  occupancyData: Record<string, number>;
  onMonthClick: (date: Date) => void;
}

const getOccupancyColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-emerald-500';
  if (percentage >= 75) return 'bg-emerald-400';
  if (percentage >= 60) return 'bg-amber-400';
  if (percentage >= 40) return 'bg-amber-300';
  if (percentage >= 20) return 'bg-red-300';
  return 'bg-muted';
};

const getOccupancyLabel = (percentage: number) => {
  if (percentage >= 90) return 'Peak Season';
  if (percentage >= 75) return 'High Demand';
  if (percentage >= 50) return 'Moderate';
  if (percentage >= 25) return 'Low Season';
  return 'Very Low';
};

export function YearView({
  date,
  bookings,
  occupancyData,
  onMonthClick,
}: YearViewProps) {
  const year = date.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(date), i));
  const today = new Date();

  // Calculate occupancy for each day
  const getDayOccupancy = (day: Date) => {
    const dayBookings = bookings.filter((b) =>
      isWithinInterval(day, {
        start: startOfDay(b.checkIn),
        end: endOfDay(b.checkOut),
      })
    );
    return dayBookings.length > 0;
  };

  // Generate mini calendar for each month
  const getMiniCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding for first week
    const startPadding = monthStart.getDay();
    const paddedDays = Array(startPadding).fill(null).concat(days);
    
    // Split into weeks
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }
    
    return weeks;
  };

  const getMonthOccupancy = (month: Date) => {
    const key = format(month, 'yyyy-MM');
    return occupancyData[key] || 0;
  };

  // TODO: integrate revenue API
  const getMonthRevenue = (month: Date) => {
    // Placeholder for future revenue integration
    return null;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Year Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{year}</h2>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-muted-foreground">90%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-muted-foreground">75%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-muted-foreground">50%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-300" />
            <span className="text-muted-foreground">&lt;50%</span>
          </div>
        </div>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((month) => {
          const weeks = getMiniCalendar(month);
          const occupancy = getMonthOccupancy(month);
          const revenue = getMonthRevenue(month);

          return (
            <div
              key={month.toISOString()}
              onClick={() => onMonthClick(month)}
              className={cn(
                'bg-card rounded-xl border border-border p-4 cursor-pointer',
                'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
                'hover:border-primary/50'
              )}
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  {format(month, 'MMMM')}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                          getOccupancyColor(occupancy)
                        )}
                      >
                        {occupancy}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getOccupancyLabel(occupancy)} - {occupancy}% Occupancy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Mini Calendar */}
              <div className="space-y-1">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div
                      key={i}
                      className="text-[9px] text-muted-foreground text-center"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7 gap-0.5">
                    {week.map((day, dayIdx) => {
                      if (!day) {
                        return <div key={dayIdx} className="w-4 h-4" />;
                      }

                      const hasBooking = getDayOccupancy(day);
                      const isToday = isSameDay(day, today);

                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            'w-4 h-4 rounded-sm text-[8px] flex items-center justify-center',
                            hasBooking
                              ? 'bg-primary/60 text-primary-foreground'
                              : 'bg-muted/50',
                            isToday && 'ring-1 ring-primary'
                          )}
                        >
                          {format(day, 'd')}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Revenue Placeholder */}
              {/* TODO: integrate revenue API */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Revenue: <span className="text-foreground font-medium">--</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
