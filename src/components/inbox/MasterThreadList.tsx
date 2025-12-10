import { format } from 'date-fns';
import { Star, Mail, MessageCircle, Facebook, Instagram, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { InboxThread, InboxFolder } from './types';

interface MasterThreadListProps {
  threads: InboxThread[];
  folders: InboxFolder[];
  selectedThreadId: string | null;
  onThreadClick: (thread: InboxThread) => void;
  onStarToggle: (threadId: string) => void;
  onMoveToFolder: (threadId: string, folderId: string | null) => void;
}

const platformIcons: Record<string, React.ElementType> = {
  gmail: Mail,
  whatsapp: MessageCircle,
  facebook: Facebook,
  instagram: Instagram,
  sms: MessageSquare,
  other: MessageCircle,
};

const platformColors: Record<string, string> = {
  gmail: 'text-red-500',
  whatsapp: 'text-green-500',
  facebook: 'text-blue-600',
  instagram: 'text-pink-500',
  sms: 'text-primary',
  other: 'text-muted-foreground',
};

export function MasterThreadList({
  threads,
  folders,
  selectedThreadId,
  onThreadClick,
  onStarToggle,
  onMoveToFolder,
}: MasterThreadListProps) {
  const getFolder = (folderId: string | null) => folders.find(f => f.id === folderId);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 1000 * 60 * 60 * 24) return format(date, 'h:mm a');
    if (diff < 1000 * 60 * 60 * 24 * 7) return format(date, 'EEE');
    return format(date, 'MMM d');
  };

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <p>No messages in this folder</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {threads.map(thread => {
        const PlatformIcon = platformIcons[thread.platform];
        const folder = getFolder(thread.folderId);
        const initials = thread.senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        return (
          <div
            key={thread.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors group',
              selectedThreadId === thread.id ? 'bg-primary/5' : 'hover:bg-muted/50',
              !thread.isRead && 'bg-primary/5'
            )}
            onClick={() => onThreadClick(thread)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => { e.stopPropagation(); onStarToggle(thread.id); }}
            >
              <Star className={cn('h-4 w-4', thread.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
            </Button>

            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn('font-medium text-sm truncate', !thread.isRead && 'font-semibold')}>
                  {thread.senderName}
                </span>
                <PlatformIcon className={cn('h-3.5 w-3.5 shrink-0', platformColors[thread.platform])} />
                {folder && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color }}
                    title={folder.name}
                  />
                )}
              </div>
              <p className={cn('text-sm truncate', !thread.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                {thread.subject}
              </p>
              <p className="text-xs text-muted-foreground truncate">{thread.snippet}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{formatTime(thread.timestamp)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Move to folder</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-popover">
                      <DropdownMenuItem onClick={() => onMoveToFolder(thread.id, null)}>
                        No folder
                      </DropdownMenuItem>
                      {folders.map(f => (
                        <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(thread.id, f.id)}>
                          <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: f.color }} />
                          {f.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
