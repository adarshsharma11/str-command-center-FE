import { CalendarBooking, VendorTask, channelColors, taskTypeColors } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, differenceInDays } from 'date-fns';
import { 
  X, 
  User, 
  Calendar, 
  Home, 
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { VendorTaskTag } from './VendorTaskTag';

interface CalendarSidePanelProps {
  booking: CalendarBooking | null;
  tasks: VendorTask[];
  onClose: () => void;
}

const channelLabels: Record<string, string> = {
  airbnb: 'Airbnb',
  vrbo: 'Vrbo',
  direct: 'Direct',
  booking: 'Booking.com',
};

const statusColors: Record<string, string> = {
  confirmed: '#10B981',
  pending: '#F59E0B',
  blocked: '#6B7280',
};

export function CalendarSidePanel({ booking, tasks, onClose }: CalendarSidePanelProps) {
  if (!booking) return null;

  const nights = differenceInDays(booking.checkOut, booking.checkIn);
  const relatedTasks = tasks.filter(t => t.bookingId === booking.id);

  return (
    <div className="w-80 border-l border-border bg-card animate-slide-in-right">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Booking Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-6">
          {/* Property & Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Home size={18} className="text-muted-foreground" />
              <span className="font-medium text-foreground">{booking.propertyName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                style={{ 
                  backgroundColor: `${channelColors[booking.channel]}20`,
                  color: channelColors[booking.channel],
                }}
              >
                {channelLabels[booking.channel]}
              </Badge>
              <Badge 
                style={{ 
                  backgroundColor: `${statusColors[booking.status]}20`,
                  color: statusColors[booking.status],
                }}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Guest Info */}
          {booking.status !== 'blocked' && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Guest
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{booking.guestName}</p>
                    {booking.guestCount && (
                      <p className="text-sm text-muted-foreground">
                        {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* TODO: integrate guest contact API */}
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Phone size={14} />
                    <span className="text-muted-foreground">Contact not available</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Mail size={14} />
                    <span className="text-muted-foreground">Email not available</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MessageSquare size={14} />
                    Open Chat
                  </Button>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Stay Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Stay Details
            </h4>
            
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-in</span>
                <span className="text-sm font-medium text-emerald-600">
                  {format(booking.checkIn, 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-out</span>
                <span className="text-sm font-medium text-red-500">
                  {format(booking.checkOut, 'MMM d, h:mm a')}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium text-foreground">
                  {nights} night{nights !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {booking.guestNotes && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-400 italic">
                  "{booking.guestNotes}"
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Vendor Tasks */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Vendor Tasks ({relatedTasks.length})
            </h4>
            
            {relatedTasks.length > 0 ? (
              <div className="space-y-2">
                {relatedTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <VendorTaskTag task={task} />
                      <Badge 
                        variant="outline"
                        className={task.status === 'completed' ? 'text-emerald-600' : ''}
                      >
                        {task.status === 'completed' && <CheckCircle2 size={12} className="mr-1" />}
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {format(task.scheduledTime, 'MMM d, h:mm a')} · {task.duration} min
                    </div>
                    {task.notes && (
                      <p className="text-xs text-muted-foreground italic">{task.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks scheduled</p>
            )}

            <Button variant="outline" size="sm" className="w-full">
              + Add Task
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
