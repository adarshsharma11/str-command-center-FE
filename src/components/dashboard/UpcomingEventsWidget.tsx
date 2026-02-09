import { LogIn, LogOut, Users, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UpcomingEvent } from '@/lib/api/dashboard';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface UpcomingEventsWidgetProps {
  checkIns: UpcomingEvent[];
  checkOuts: UpcomingEvent[];
}

function formatEventDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
}

function EventCard({ event }: { event: UpcomingEvent }) {
  const isCheckIn = event.type === 'check_in';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
        isCheckIn ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isCheckIn ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
        )}
      >
        {isCheckIn ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">{event.guest_name}</span>
          <Badge variant="secondary" className="text-xs">
            {formatEventDate(event.date)}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{event.property_name}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event.guests_count} guests
          </span>
        </div>

        {event.notes && (
          <p className="text-xs text-muted-foreground italic mt-1">
            {event.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export function UpcomingEventsWidget({ checkIns, checkOuts }: UpcomingEventsWidgetProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Check-ins Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LogIn className="h-4 w-4 text-green-600" />
          <h3 className="font-medium">Check-ins</h3>
          <Badge variant="secondary" className="ml-auto">
            {checkIns.length}
          </Badge>
        </div>

        {checkIns.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No upcoming check-ins
          </p>
        ) : (
          <div className="space-y-2">
            {checkIns.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Check-outs Column */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LogOut className="h-4 w-4 text-orange-600" />
          <h3 className="font-medium">Check-outs</h3>
          <Badge variant="secondary" className="ml-auto">
            {checkOuts.length}
          </Badge>
        </div>

        {checkOuts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No upcoming check-outs
          </p>
        ) : (
          <div className="space-y-2">
            {checkOuts.slice(0, 5).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
