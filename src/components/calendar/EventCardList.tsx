import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarBooking, VendorTask, ColorAssignment } from './types';
import { Home, User, Calendar, Clock } from 'lucide-react';

interface EventCardListProps {
  bookings: CalendarBooking[];
  tasks: VendorTask[];
  colorAssignments: ColorAssignment[];
  onBookingClick: (booking: CalendarBooking) => void;
  onTaskClick: (task: VendorTask) => void;
}

export function EventCardList({
  bookings,
  tasks,
  colorAssignments,
  onBookingClick,
  onTaskClick,
}: EventCardListProps) {
  const getColor = (category: string, id: string) => {
    const assignment = colorAssignments.find(
      (a) => a.category === category && a.id === id
    );
    return assignment?.color || '#6366f1';
  };

  const getStatusBadge = (status: CalendarBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Pending</Badge>;
      case 'blocked':
        return <Badge variant="secondary">Blocked</Badge>;
      default:
        return null;
    }
  };

  // Sort bookings by check-in date
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  );

  // Sort tasks by scheduled time
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  if (bookings.length === 0 && tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No events in this view period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bookings Section */}
      {sortedBookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Bookings ({sortedBookings.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sortedBookings.map((booking) => (
              <Card
                key={booking.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: getColor('property', booking.propertyId) }}
                onClick={() => onBookingClick(booking)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.propertyName}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {booking.guestName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{booking.guestName}</span>
                      {booking.guestCount && (
                        <span className="text-xs">({booking.guestCount} guests)</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        In: {format(new Date(booking.checkIn), 'h:mm a')} / Out: {format(new Date(booking.checkOut), 'h:mm a')}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {booking.channel}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {sortedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Vendor Tasks ({sortedTasks.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sortedTasks.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: getColor('taskType', task.type) }}
                onClick={() => onTaskClick(task)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium capitalize">{task.type}</span>
                    <Badge
                      variant={task.status === 'completed' ? 'default' : 'outline'}
                      className={task.status === 'completed' ? 'bg-emerald-500' : ''}
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{task.vendorName}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(task.scheduledTime), 'MMM d, yyyy')}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{format(new Date(task.scheduledTime), 'h:mm a')}</span>
                  </div>
                  {task.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
