import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, User, Calendar, Clock, Phone, Mail, CreditCard, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarBooking, VendorTask, ColorAssignment } from './types';

interface FlippableBookingCardProps {
  booking: CalendarBooking;
  color: string;
  onDetailsClick: () => void;
}

export function FlippableBookingCard({ booking, color, onDetailsClick }: FlippableBookingCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

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

  const getPaymentBadge = (status: CalendarBooking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500/10 text-amber-600">Partial</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500/10 text-red-600">Unpaid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="relative h-48 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d',
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 w-full h-full border-l-4 backface-hidden"
          style={{ 
            borderLeftColor: color,
            backfaceVisibility: 'hidden',
          }}
        >
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.propertyName}</span>
                </div>
                {getStatusBadge(booking.status)}
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
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Badge variant="outline" className="text-xs">
                {booking.channel}
              </Badge>
              <span className="text-xs text-muted-foreground">Tap to flip</span>
            </div>
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className="absolute inset-0 w-full h-full border-l-4 backface-hidden"
          style={{ 
            borderLeftColor: color,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Booking Details</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Check-in: {format(new Date(booking.checkIn), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Check-out: {format(new Date(booking.checkOut), 'h:mm a')}</span>
                </div>
              </div>

              {booking.guestEmail && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{booking.guestEmail}</span>
                </div>
              )}

              {booking.guestPhone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{booking.guestPhone}</span>
                </div>
              )}

              {booking.totalAmount && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">${booking.totalAmount.toLocaleString()}</span>
                  {getPaymentBadge(booking.paymentStatus)}
                </div>
              )}

              {booking.notes && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3 mt-0.5" />
                  <span className="line-clamp-2">{booking.notes}</span>
                </div>
              )}
            </div>

            <span className="text-xs text-muted-foreground text-center">Tap to flip back</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FlippableTaskCardProps {
  task: VendorTask;
  color: string;
  onDetailsClick: () => void;
}

export function FlippableTaskCard({ task, color, onDetailsClick }: FlippableTaskCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-40 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 w-full h-full border-l-4"
          style={{ 
            borderLeftColor: color,
            backfaceVisibility: 'hidden',
          }}
        >
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-2">
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
            </div>
            <span className="text-xs text-muted-foreground">Tap to flip</span>
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className="absolute inset-0 w-full h-full border-l-4"
          style={{ 
            borderLeftColor: color,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Task Details</h4>
              <div className="text-sm">
                <span className="text-muted-foreground">Property: </span>
                <span>{task.propertyId}</span>
              </div>
              {task.notes && (
                <p className="text-sm text-muted-foreground line-clamp-3">{task.notes}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground text-center">Tap to flip back</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
