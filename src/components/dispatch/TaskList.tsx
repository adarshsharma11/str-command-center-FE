// Added by Agent 2
import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import type { DispatchTask, TaskType, DispatchStatus } from '@/types/dispatch';

interface TaskListProps {
  tasks: DispatchTask[];
  isLoading: boolean;
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DispatchStatus | 'all'>('all');

  const filtered = tasks.filter((t) => {
    if (typeFilter !== 'all' && t.task_type !== typeFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName =
        t.property_name?.toLowerCase().includes(q) ||
        t.property_id?.toLowerCase().includes(q) ||
        t.service_name?.toLowerCase().includes(q) ||
        t.reservation_id?.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex gap-1">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'cleaning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('cleaning')}
          >
            Cleaning
          </Button>
          <Button
            variant={typeFilter === 'service' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('service')}
          >
            Services
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            variant={statusFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'accepted' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('accepted')}
          >
            Accepted
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tasks found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={`${task.task_type}-${task.id}`} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
