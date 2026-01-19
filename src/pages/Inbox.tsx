import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { FolderSidebar } from '@/components/inbox/FolderSidebar';
import { MasterThreadList } from '@/components/inbox/MasterThreadList';
import { MessagePanel } from '@/components/inbox/MessagePanel';
import { mockFolders } from '@/components/inbox/mockInboxData';
import type { InboxFolder, InboxThread } from '@/components/inbox/types';
import { useInboxQuery, mapInboxThreads, type InboxFilters } from '@/lib/api/emails';
import { Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function Inbox() {
  const [folders, setFolders] = useState<InboxFolder[]>(mockFolders);
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [filters, setFilters] = useState<InboxFilters>({ folder: 'BOTH', limit: 50, only_booking: false });
  const { data: inboxResp, isLoading, error, refetch } = useInboxQuery(filters);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (inboxResp) {
      console.log('Inbox API Response:', inboxResp);
      setThreads(mapInboxThreads(inboxResp));
    }
  }, [inboxResp]);

  const filteredThreads = useMemo(() => {
    if (!selectedFolderId) return threads;
    // Include threads from selected folder and its children
    const getAllChildFolderIds = (parentId: string): string[] => {
      const children = folders.filter(f => f.parentId === parentId);
      return [parentId, ...children.flatMap(c => getAllChildFolderIds(c.id))];
    };
    const folderIds = getAllChildFolderIds(selectedFolderId);
    return threads.filter(t => t.folderId && folderIds.includes(t.folderId));
  }, [threads, selectedFolderId, folders]);

  const threadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    threads.forEach(t => {
      if (t.folderId) counts[t.folderId] = (counts[t.folderId] || 0) + 1;
    });
    return counts;
  }, [threads]);

  const handleStarToggle = (threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isStarred: !t.isStarred } : t));
  };

  const handleThreadClick = (thread: InboxThread) => {
    setSelectedThread(thread);
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, isRead: true } : t));
  };

  const handleMoveToFolder = (threadId: string, folderId: string | null) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, folderId } : t));
    if (selectedThread?.id === threadId) {
      setSelectedThread(prev => prev ? { ...prev, folderId } : null);
    }
  };

  const handleFolderCreate = (folder: Omit<InboxFolder, 'id'>) => {
    setFolders(prev => [...prev, { ...folder, id: `folder-${Date.now()}` }]);
  };

  const handleFolderUpdate = (folder: InboxFolder) => {
    setFolders(prev => prev.map(f => f.id === folder.id ? folder : f));
  };

  const handleFolderDelete = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
    setThreads(prev => prev.map(t => t.folderId === folderId ? { ...t, folderId: null } : t));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="w-full px-4 py-3 border-b border-border bg-background flex items-center gap-3 sticky top-0 z-20">
          <div className="w-36">
            <div className="h-8 bg-muted rounded" />
          </div>
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-8 bg-muted rounded w-8" />
        </div>
      ) : (
        <div className="w-full px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 flex flex-wrap items-center gap-2 sm:gap-3 sticky top-0 z-20">
          <div className="w-36">
            <Select
              value={filters.folder || 'BOTH'}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, folder: v as 'INBOX' | 'SENT' | 'BOTH' }))}
            >
              <SelectTrigger className="h-8 px-2 text-sm">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INBOX">INBOX</SelectItem>
                <SelectItem value="SENT">SENT</SelectItem>
                <SelectItem value="BOTH">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            value={filters.q || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            placeholder="Search by subject or text"
            className="h-8 text-sm flex-1 min-w-[180px] max-w-[360px]"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['emails'] });
            }}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex h-[calc(100vh-4rem)]">
        {isLoading && (
          <>
            <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-7 bg-muted rounded" />
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col border-r border-border">
              <div className="px-4 py-3 border-b border-border">
                <div className="h-6 w-40 bg-muted rounded mb-2" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            </div>
            <div className="w-[480px] flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="h-10 w-64 bg-muted rounded" />
              </div>
              <div className="flex-1 p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded w-3/4" />
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <div className="h-10 bg-muted rounded" />
              </div>
            </div>
          </>
        )}
        {!isLoading && error && (
          <div className="flex-1 p-6">
            <div className="text-red-500">Error loading inbox</div>
            <Button onClick={() => refetch()} variant="outline" className="mt-2">Retry</Button>
          </div>
        )}
        {!isLoading && !error && (
          <>
            <FolderSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onFolderCreate={handleFolderCreate}
              onFolderUpdate={handleFolderUpdate}
              onFolderDelete={handleFolderDelete}
              threadCounts={threadCounts}
              totalCount={threads.length}
            />
            <div className="w-[420px] flex flex-col border-r border-border overflow-y-auto">
              <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 sticky top-0 z-10">
                <h1 className="text-lg font-semibold text-foreground">
                  {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'All Messages'}
                </h1>
                <p className="text-sm text-muted-foreground">{filteredThreads.length} conversations</p>
              </div>
              <MasterThreadList
                threads={filteredThreads}
                folders={folders}
                selectedThreadId={selectedThread?.id || null}
                onThreadClick={handleThreadClick}
                onStarToggle={handleStarToggle}
                onMoveToFolder={handleMoveToFolder}
              />
            </div>
            <div className="flex-1 flex">
              <MessagePanel
                thread={selectedThread}
                folders={folders}
                onClose={() => setSelectedThread(null)}
                onMoveToFolder={handleMoveToFolder}
                mailboxFolder={selectedThread?.mailboxFolder ?? (filters.folder === 'SENT' ? 'SENT' : 'INBOX')}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
