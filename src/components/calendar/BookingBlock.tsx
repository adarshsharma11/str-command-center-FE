import { CalendarBooking, channelColors } from './types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, differenceInDays } from 'date-fns';
import { User, Calendar, Home } from 'lucide-react';

interface BookingBlockProps {
  booking: CalendarBooking;
  propertyColor?: string;
  variant?: 'full' | 'compact' | 'minimal';
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const channelLabels: Record<string, string> = {
  airbnb: 'Airbnb',
  vrbo: 'Vrbo',
  direct: 'Direct',
  booking: 'Booking.com',
};

export function BookingBlock({ 
  booking, 
  propertyColor, 
  variant = 'full',
  onClick,
  style,
  className,
}: BookingBlockProps) {
  const color = propertyColor || channelColors[booking.channel];
  const nights = differenceInDays(booking.checkOut, booking.checkIn);

  const content = (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        booking.status === 'blocked' && 'opacity-60 bg-stripes',
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `4px solid ${color}`,
        ...style,
      }}
    >
      {variant === 'full' && (
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {booking.status === 'blocked' ? 'Blocked' : booking.guestName}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Home size={12} />
                {booking.propertyName}
              </p>
            </div>
            <Badge 
              variant="secondary" 
              className="text-[10px] px-1.5 py-0"
              style={{ 
                backgroundColor: `${channelColors[booking.channel]}20`,
                color: channelColors[booking.channel],
              }}
            >
              {channelLabels[booking.channel]}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {nights} night{nights !== 1 ? 's' : ''}
            </span>
            {booking.guestCount && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-600 font-medium">
              In: {format(booking.checkIn, 'h:mm a')}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="text-red-500 font-medium">
              Out: {format(booking.checkOut, 'h:mm a')}
            </span>
          </div>

          {booking.guestNotes && (
            <p className="text-xs text-muted-foreground italic line-clamp-2">
              "{booking.guestNotes}"
            </p>
          )}
        </div>
      )}

      {variant === 'compact' && (
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate text-foreground">
            {booking.status === 'blocked' ? 'Blocked' : booking.guestName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {booking.propertyName}
          </p>
        </div>
      )}

      {variant === 'minimal' && (
        <div className="px-2 py-1">
          <p className="text-xs font-medium truncate" style={{ color }}>
            {booking.status === 'blocked' ? '🚫' : booking.guestName}
          </p>
        </div>
      )}
    </div>
  );

  if (variant === 'minimal' || variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{booking.propertyName}</p>
              {booking.status !== 'blocked' && (
                <p className="text-sm">{booking.guestName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(booking.checkIn, 'MMM d')} - {format(booking.checkOut, 'MMM d')}
              </p>
              <Badge 
                variant="secondary" 
                className="text-[10px]"
                style={{ 
                  backgroundColor: `${channelColors[booking.channel]}20`,
                  color: channelColors[booking.channel],
                }}
              >
                {channelLabels[booking.channel]}
              </Badge>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
