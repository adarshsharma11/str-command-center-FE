import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewToggle } from '@/components/inbox/ViewToggle';
import { ThreadList } from '@/components/inbox/ThreadList';
import { FloatingChatBubble } from '@/components/inbox/FloatingChatBubble';
import { LabelManager } from '@/components/inbox/LabelManager';
import { OutlookLayout } from '@/components/inbox/OutlookLayout';
import { mockLabels, mockThreads } from '@/components/inbox/mockInboxData';
import type { InboxViewType, InboxLabel, InboxThread } from '@/components/inbox/types';
import { Mail, Inbox as InboxIcon } from 'lucide-react';

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
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
              <p className="text-muted-foreground">Manage your guest communications</p>
            </div>
            <ViewToggle view={viewType} onViewChange={setViewType} />
          </div>
          
          <Card className="overflow-hidden">
            <div className="h-[calc(100vh-12rem)]">
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
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
            <p className="text-muted-foreground">Manage your guest communications</p>
          </div>
          <ViewToggle view={viewType} onViewChange={setViewType} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Labels Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Labels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LabelManager
                labels={labels}
                onLabelCreate={handleLabelCreate}
                onLabelUpdate={handleLabelUpdate}
                onLabelDelete={handleLabelDelete}
                selectedLabelId={selectedLabelId}
                onLabelSelect={setSelectedLabelId}
              />
            </CardContent>
          </Card>

          {/* Thread List */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <InboxIcon className="h-5 w-5" />
                {selectedLabelId
                  ? labels.find((l) => l.id === selectedLabelId)?.name || 'Messages'
                  : 'All Messages'}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredThreads.length} conversations)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-18rem)]">
                <ThreadList
                  threads={filteredThreads}
                  labels={labels}
                  selectedThreadId={selectedThread?.id || null}
                  onThreadClick={handleThreadClick}
                  onStarToggle={handleStarToggle}
                />
              </ScrollArea>
            </CardContent>
          </Card>
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
