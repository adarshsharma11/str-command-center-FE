import { VendorTask, taskTypeColors } from './types';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Wine, 
  Heart, 
  Wrench, 
  Headphones 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface VendorTaskTagProps {
  task: VendorTask;
  compact?: boolean;
  onClick?: () => void;
}

const taskIcons: Record<VendorTask['type'], React.ElementType> = {
  cleaning: Sparkles,
  chef: UtensilsCrossed,
  bartender: Wine,
  massage: Heart,
  handyman: Wrench,
  concierge: Headphones,
};

const taskLabels: Record<VendorTask['type'], string> = {
  cleaning: 'Cleaning',
  chef: 'Private Chef',
  bartender: 'Bartender',
  massage: 'Massage',
  handyman: 'Handyman',
  concierge: 'Concierge',
};

export function VendorTaskTag({ task, compact = false, onClick }: VendorTaskTagProps) {
  const Icon = taskIcons[task.type];
  const color = taskTypeColors[task.type];

  const content = (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md cursor-pointer transition-all duration-200',
        'hover:scale-105 hover:shadow-sm',
        compact ? 'p-1' : 'px-2 py-1'
      )}
      style={{ 
        backgroundColor: `${color}15`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <Icon 
        className="flex-shrink-0" 
        style={{ color }} 
        size={compact ? 12 : 14} 
      />
      {!compact && (
        <span 
          className="text-xs font-medium truncate"
          style={{ color }}
        >
          {task.vendorName}
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{taskLabels[task.type]}</p>
              <p className="text-xs text-muted-foreground">{task.vendorName}</p>
              <p className="text-xs">{format(task.scheduledTime, 'h:mm a')} · {task.duration} min</p>
              {task.notes && (
                <p className="text-xs text-muted-foreground italic">{task.notes}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
