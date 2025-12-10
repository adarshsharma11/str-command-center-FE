import { useState } from 'react';
import { format } from 'date-fns';
import { Send, Paperclip, X, Mail, MessageCircle, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { InboxThread, InboxFolder } from './types';

interface MessagePanelProps {
  thread: InboxThread | null;
  folders: InboxFolder[];
  onClose: () => void;
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

const platformLabels: Record<string, string> = {
  gmail: 'Email',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  sms: 'SMS',
  other: 'Message',
};

export function MessagePanel({ thread, folders, onClose, onMoveToFolder }: MessagePanelProps) {
  const [message, setMessage] = useState('');

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 text-muted-foreground">
        <p>Select a conversation to view</p>
      </div>
    );
  }

  const PlatformIcon = platformIcons[thread.platform];
  const folder = folders.find(f => f.id === thread.folderId);
  const initials = thread.senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{thread.senderName}</span>
            <PlatformIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{platformLabels[thread.platform]}</span>
            {folder && (
              <>
                <span>•</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
                    {folder.name}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover">
                    <DropdownMenuItem onClick={() => onMoveToFolder(thread.id, null)}>
                      Remove from folder
                    </DropdownMenuItem>
                    {folders.filter(f => f.id !== folder.id).map(f => (
                      <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(thread.id, f.id)}>
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!folder && (
              <>
                <span>•</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-foreground">
                    Add to folder
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover">
                    {folders.map(f => (
                      <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(thread.id, f.id)}>
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {thread.messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-[80%]',
                msg.isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm',
                  msg.isOutgoing
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {format(msg.timestamp, 'h:mm a')}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="resize-none min-h-[40px] max-h-24"
            rows={1}
          />
          <Button size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
