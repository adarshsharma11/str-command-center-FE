import { useState } from 'react';
import { format } from 'date-fns';
import { Send, Paperclip, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LabelManager } from './LabelManager';
import type { InboxThread, InboxLabel } from './types';

interface OutlookLayoutProps {
  threads: InboxThread[];
  labels: InboxLabel[];
  selectedThread: InboxThread | null;
  selectedLabelId: string | null;
  onThreadSelect: (thread: InboxThread) => void;
  onStarToggle: (threadId: string) => void;
  onLabelCreate: (label: Omit<InboxLabel, 'id'>) => void;
  onLabelUpdate: (label: InboxLabel) => void;
  onLabelDelete: (labelId: string) => void;
  onLabelSelect: (labelId: string | null) => void;
}

export function OutlookLayout({
  threads,
  labels,
  selectedThread,
  selectedLabelId,
  onThreadSelect,
  onStarToggle,
  onLabelCreate,
  onLabelUpdate,
  onLabelDelete,
  onLabelSelect,
}: OutlookLayoutProps) {
  const [message, setMessage] = useState('');

  const getLabel = (labelId: string) => labels.find((l) => l.id === labelId);

  const filteredThreads = selectedLabelId
    ? threads.filter((t) => t.labels.includes(selectedLabelId))
    : threads;

  return (
    <div className="flex h-full">
      {/* Left column - Labels */}
      <div className="w-64 bg-muted/30 border-r border-border shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Folders & Labels</h3>
        </div>
        <LabelManager
          labels={labels}
          onLabelCreate={onLabelCreate}
          onLabelUpdate={onLabelUpdate}
          onLabelDelete={onLabelDelete}
          selectedLabelId={selectedLabelId}
          onLabelSelect={onLabelSelect}
        />
      </div>

      {/* Center column - Thread list */}
      <div className="w-80 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {selectedLabelId
              ? labels.find((l) => l.id === selectedLabelId)?.name || 'Messages'
              : 'All Messages'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredThreads.length} conversations
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  'p-4 cursor-pointer transition-colors hover:bg-muted/50',
                  selectedThread?.id === thread.id && 'bg-accent',
                  !thread.isRead && 'bg-primary/5'
                )}
                onClick={() => onThreadSelect(thread)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStarToggle(thread.id);
                    }}
                    className="shrink-0 mt-0.5"
                  >
                    {thread.isStarred ? (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm truncate',
                          !thread.isRead && 'font-semibold text-foreground'
                        )}
                      >
                        {thread.senderName}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(thread.timestamp, 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {thread.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {thread.snippet}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 ml-7">
                  {thread.labels.slice(0, 3).map((labelId) => {
                    const label = getLabel(labelId);
                    return label ? (
                      <div
                        key={labelId}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right column - Message preview */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {selectedThread.senderName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedThread.senderName}</p>
                  <p className="text-sm text-muted-foreground">{selectedThread.subject}</p>
                </div>
                <div className="flex gap-2">
                  {selectedThread.labels.map((labelId) => {
                    const label = getLabel(labelId);
                    return label ? (
                      <Badge
                        key={labelId}
                        variant="outline"
                        style={{ borderColor: label.color, color: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-3xl">
                {selectedThread.messages.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {msg.from
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{msg.from}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(msg.timestamp, 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="ml-12 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="p-6 border-t border-border bg-card">
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="resize-none"
                  rows={3}
                />
                <Button size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-lg">Select a conversation</p>
            <p className="text-sm">Choose a thread from the list to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
