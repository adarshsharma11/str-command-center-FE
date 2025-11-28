import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import type { Task } from '@/types';

interface PriorityTaskWidgetProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function PriorityTaskWidget({ tasks, onTaskClick }: PriorityTaskWidgetProps) {
  const priorityTasks = tasks.filter(t => t.priority === 'P1' || t.priority === 'P2');

  const priorityColors = {
    P1: 'bg-destructive text-destructive-foreground',
    P2: 'bg-orange-500 text-white',
    P3: 'bg-yellow-500 text-white',
    P4: 'bg-muted text-muted-foreground',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Priority Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {priorityTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No urgent tasks</p>
        ) : (
          <div className="space-y-3">
            {priorityTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                onClick={() => onTaskClick?.(task.id)}
              >
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.type} • Due {task.dueDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
