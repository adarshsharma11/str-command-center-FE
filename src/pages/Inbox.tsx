import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { FolderSidebar } from '@/components/inbox/FolderSidebar';
import { MasterThreadList } from '@/components/inbox/MasterThreadList';
import { MessagePanel } from '@/components/inbox/MessagePanel';
import { mockFolders, mockThreads } from '@/components/inbox/mockInboxData';
import type { InboxFolder, InboxThread } from '@/components/inbox/types';

export default function Inbox() {
  const [folders, setFolders] = useState<InboxFolder[]>(mockFolders);
  const [threads, setThreads] = useState<InboxThread[]>(mockThreads);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);

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
      <div className="flex h-[calc(100vh-4rem)]">
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
        <div className="flex-1 flex flex-col border-r border-border">
          <div className="px-4 py-3 border-b border-border">
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
        <div className="w-[480px] flex">
          <MessagePanel
            thread={selectedThread}
            folders={folders}
            onClose={() => setSelectedThread(null)}
            onMoveToFolder={handleMoveToFolder}
          />
        </div>
      </div>
    </Layout>
  );
}
