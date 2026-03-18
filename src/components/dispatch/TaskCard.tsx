// Added by Agent 2
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Home, Briefcase } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { DispatchTask } from '@/types/dispatch';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
};

interface TaskCardProps {
  task: DispatchTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const status = statusConfig[task.status] || statusConfig.pending;
  const dateStr = task.scheduled_date || task.service_date;
  const displayDate = dateStr
    ? format(parseISO(dateStr), 'MMM d, yyyy')
    : '—';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {task.task_type === 'cleaning' ? (
              <Home className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">
              {task.task_type === 'cleaning'
                ? task.property_name || task.property_id || 'Cleaning'
                : task.service_name || 'Service'}
            </span>
          </div>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {displayDate}
          </span>
          {task.time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {task.time}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {task.task_type === 'cleaning' ? 'Cleaning' : 'Service'}
          </Badge>
          {task.crew_name && <span>Assigned: {task.crew_name}</span>}
          {task.reservation_id && (
            <span className="ml-auto font-mono">#{task.reservation_id}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
