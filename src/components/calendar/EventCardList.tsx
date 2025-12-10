import { CalendarBooking, VendorTask, ColorAssignment } from './types';
import { FlippableBookingCard, FlippableTaskCard } from './FlippableEventCard';

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
              <FlippableBookingCard
                key={booking.id}
                booking={booking}
                color={getColor('property', booking.propertyId)}
                onDetailsClick={() => onBookingClick(booking)}
              />
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
              <FlippableTaskCard
                key={task.id}
                task={task}
                color={getColor('taskType', task.type)}
                onDetailsClick={() => onTaskClick(task)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
