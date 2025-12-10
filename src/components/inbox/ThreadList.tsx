import { format } from 'date-fns';
import { Star, StarOff } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { InboxThread, InboxLabel } from './types';

interface ThreadListProps {
  threads: InboxThread[];
  labels: InboxLabel[];
  selectedThreadId: string | null;
  onThreadClick: (thread: InboxThread) => void;
  onStarToggle: (threadId: string) => void;
}

export function ThreadList({
  threads,
  labels,
  selectedThreadId,
  onThreadClick,
  onStarToggle,
}: ThreadListProps) {
  const getLabel = (labelId: string) => labels.find((l) => l.id === labelId);

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">No messages found</p>
        <p className="text-sm">Try selecting a different label</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {threads.map((thread) => (
        <div
          key={thread.id}
          className={cn(
            'flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-muted/50',
            selectedThreadId === thread.id && 'bg-accent',
            !thread.isRead && 'bg-primary/5'
          )}
          onClick={() => onThreadClick(thread)}
        >
          {/* Star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStarToggle(thread.id);
            }}
            className="shrink-0 text-muted-foreground hover:text-yellow-500 transition-colors"
          >
            {thread.isStarred ? (
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </button>

          {/* Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {thread.senderName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className={cn(
                  'text-sm truncate',
                  !thread.isRead ? 'font-semibold text-foreground' : 'text-foreground'
                )}
              >
                {thread.senderName}
              </span>
              {/* Label dots */}
              <div className="flex gap-1.5 shrink-0">
                {thread.labels.slice(0, 3).map((labelId) => {
                  const label = getLabel(labelId);
                  return label ? (
                    <div
                      key={labelId}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: label.color }}
                      title={label.name}
                    />
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={cn('truncate', !thread.isRead && 'text-foreground font-medium')}>
                {thread.subject}
              </span>
              <span className="text-muted-foreground">–</span>
              <span className="text-muted-foreground truncate flex-1">{thread.snippet}</span>
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-sm text-muted-foreground shrink-0">
            {format(thread.timestamp, 'MMM d')}
          </span>
        </div>
      ))}
    </div>
  );
}
