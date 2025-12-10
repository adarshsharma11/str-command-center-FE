import { useState } from 'react';
import { format } from 'date-fns';
import { X, Minimize2, Maximize2, Tag, Send, Paperclip, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { InboxThread, InboxLabel } from './types';

interface FloatingChatBubbleProps {
  thread: InboxThread;
  labels: InboxLabel[];
  onClose: () => void;
  onLabelToggle: (threadId: string, labelId: string) => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
}

export function FloatingChatBubble({
  thread,
  labels,
  onClose,
  onLabelToggle,
  isMinimized,
  onMinimizeToggle,
}: FloatingChatBubbleProps) {
  const [message, setMessage] = useState('');

  const initials = thread.senderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getLabel = (labelId: string) => labels.find((l) => l.id === labelId);

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onMinimizeToggle}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/30">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{thread.senderName}</p>
          <div className="flex gap-1.5 mt-1">
            {thread.labels.slice(0, 2).map((labelId) => {
              const label = getLabel(labelId);
              return label ? (
                <Badge
                  key={labelId}
                  variant="outline"
                  className="text-xs px-2 py-0"
                  style={{ borderColor: label.color, color: label.color }}
                >
                  {label.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>

        {/* Label assignment */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Tag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3" align="end">
            <p className="text-xs text-muted-foreground mb-3 font-medium">Assign Labels</p>
            <div className="space-y-2">
              {labels.map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <Checkbox
                    checked={thread.labels.includes(label.id)}
                    onCheckedChange={() => onLabelToggle(thread.id, label.id)}
                  />
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm">{label.name}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onMinimizeToggle}>
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-96 p-4">
        <div className="space-y-4">
          {thread.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-[85%]',
                msg.isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-sm',
                  msg.isOutgoing
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground mt-1.5">
                {format(msg.timestamp, 'h:mm a')}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="resize-none min-h-[40px] max-h-24"
            rows={1}
          />
          <Button size="icon" className="h-10 w-10 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FloatingIconProps {
  onClick: () => void;
}

export function FloatingChatIcon({ onClick }: FloatingIconProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
