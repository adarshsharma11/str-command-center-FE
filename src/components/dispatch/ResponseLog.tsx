// Added by Agent 2
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import type { TaskResponse } from '@/types/dispatch';

interface ResponseLogProps {
  responses: TaskResponse[];
  isLoading: boolean;
}

export function ResponseLog({ responses, isLoading }: ResponseLogProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No responses recorded yet
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Date/Time</TableHead>
            <TableHead>Responded At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                {r.person_name || '—'}
              </TableCell>
              <TableCell>{r.task_name || `Task #${r.task_id}`}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {r.task_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    r.response === 'accepted'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }
                >
                  {r.response === 'accepted' ? 'Accepted' : 'Rejected'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {r.task_date_time
                  ? format(parseISO(r.task_date_time), 'MMM d, yyyy HH:mm')
                  : '—'}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {r.created_at
                  ? format(parseISO(r.created_at), 'MMM d, yyyy HH:mm')
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
