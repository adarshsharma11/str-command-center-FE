import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewToggle } from '@/components/inbox/ViewToggle';
import { ThreadList } from '@/components/inbox/ThreadList';
import { FloatingChatBubble, FloatingChatIcon } from '@/components/inbox/FloatingChatBubble';
import { LabelManager } from '@/components/inbox/LabelManager';
import { OutlookLayout } from '@/components/inbox/OutlookLayout';
import { mockLabels, mockThreads } from '@/components/inbox/mockInboxData';
import type { InboxViewType, InboxLabel, InboxThread } from '@/components/inbox/types';

export default function Inbox() {
  const [viewType, setViewType] = useState<InboxViewType>('gmail');
  const [labels, setLabels] = useState<InboxLabel[]>(mockLabels);
  const [threads, setThreads] = useState<InboxThread[]>(mockThreads);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const filteredThreads = selectedLabelId
    ? threads.filter((t) => t.labels.includes(selectedLabelId))
    : threads;

  const handleStarToggle = (threadId: string) => {
    setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, isStarred: !t.isStarred } : t));
  };

  const handleLabelCreate = (label: Omit<InboxLabel, 'id'>) => {
    setLabels((prev) => [...prev, { ...label, id: `label-${Date.now()}` }]);
  };

  const handleLabelUpdate = (label: InboxLabel) => {
    setLabels((prev) => prev.map((l) => l.id === label.id ? label : l));
  };

  const handleLabelDelete = (labelId: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
    setThreads((prev) => prev.map((t) => ({ ...t, labels: t.labels.filter((l) => l !== labelId) })));
    if (selectedLabelId === labelId) setSelectedLabelId(null);
  };

  const handleLabelToggle = (threadId: string, labelId: string) => {
    setThreads((prev) => prev.map((t) => {
      if (t.id !== threadId) return t;
      const hasLabel = t.labels.includes(labelId);
      return { ...t, labels: hasLabel ? t.labels.filter((l) => l !== labelId) : [...t.labels, labelId] };
    }));
    if (selectedThread?.id === threadId) {
      setSelectedThread((prev) => prev ? { ...prev, labels: prev.labels.includes(labelId) ? prev.labels.filter((l) => l !== labelId) : [...prev.labels, labelId] } : null);
    }
  };

  const handleThreadClick = (thread: InboxThread) => {
    setSelectedThread(thread);
    setThreads((prev) => prev.map((t) => t.id === thread.id ? { ...t, isRead: true } : t));
    setIsChatMinimized(false);
  };

  if (viewType === 'outlook') {
    return (
      <Layout>
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="p-4 border-b border-border bg-card flex items-center justify-between">
            <h1 className="text-xl font-bold">Inbox</h1>
            <ViewToggle view={viewType} onViewChange={setViewType} />
          </div>
          <div className="flex-1 overflow-hidden">
            <OutlookLayout
              threads={threads}
              labels={labels}
              selectedThread={selectedThread}
              selectedLabelId={selectedLabelId}
              onThreadSelect={handleThreadClick}
              onStarToggle={handleStarToggle}
              onLabelCreate={handleLabelCreate}
              onLabelUpdate={handleLabelUpdate}
              onLabelDelete={handleLabelDelete}
              onLabelSelect={setSelectedLabelId}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-56 bg-card border-r border-border hidden md:block">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Inbox</h2>
            <ViewToggle view={viewType} onViewChange={setViewType} />
          </div>
          <LabelManager
            labels={labels}
            onLabelCreate={handleLabelCreate}
            onLabelUpdate={handleLabelUpdate}
            onLabelDelete={handleLabelDelete}
            selectedLabelId={selectedLabelId}
            onLabelSelect={setSelectedLabelId}
          />
        </div>

        {/* Thread List */}
        <div className="flex-1 bg-background">
          <div className="p-4 border-b border-border md:hidden flex items-center justify-between">
            <h2 className="font-semibold">Inbox</h2>
            <ViewToggle view={viewType} onViewChange={setViewType} />
          </div>
          <ScrollArea className="h-full">
            <ThreadList
              threads={filteredThreads}
              labels={labels}
              selectedThreadId={selectedThread?.id || null}
              onThreadClick={handleThreadClick}
              onStarToggle={handleStarToggle}
            />
          </ScrollArea>
        </div>
      </div>

      {/* Floating Chat */}
      {selectedThread && (
        <FloatingChatBubble
          thread={selectedThread}
          labels={labels}
          onClose={() => setSelectedThread(null)}
          onLabelToggle={handleLabelToggle}
          isMinimized={isChatMinimized}
          onMinimizeToggle={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </Layout>
  );
}
