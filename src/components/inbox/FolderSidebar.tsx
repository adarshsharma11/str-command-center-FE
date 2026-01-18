import { useState } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, Folder, Plus, GripVertical, Inbox, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { InboxFolder } from './types';

interface FolderSidebarProps {
  folders: InboxFolder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate: (folder: Omit<InboxFolder, 'id'>) => void;
  onFolderUpdate: (folder: InboxFolder) => void;
  onFolderDelete: (folderId: string) => void;
  threadCounts: Record<string, number>;
  totalCount: number;
}

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#22c55e', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export function FolderSidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  threadCounts,
  totalCount,
}: FolderSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(folders.map(f => f.id)));
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(COLORS[0]);
  const [editingFolder, setEditingFolder] = useState<InboxFolder | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const getFolderChildren = (parentId: string | null) =>
    folders.filter(f => f.parentId === parentId).sort((a, b) => a.order - b.order);

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    onFolderCreate({ name: newFolderName.trim(), color: newFolderColor, parentId: null, order: folders.length });
    setNewFolderName('');
    setNewFolderColor(COLORS[0]);
    setIsCreateOpen(false);
  };

  const handleUpdate = () => {
    if (!editingFolder || !editingFolder.name.trim()) return;
    onFolderUpdate(editingFolder);
    setEditingFolder(null);
  };

  const renderFolder = (folder: InboxFolder, depth: number = 0) => {
    const children = getFolderChildren(folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = children.length > 0;
    const count = threadCounts[folder.id] || 0;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors group',
            selectedFolderId === folder.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          {hasChildren ? (
            <button onClick={(e) => toggleFolder(folder.id, e)} className="p-0.5 hover:bg-muted rounded">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
          <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
          {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => setEditingFolder(folder)}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFolderDelete(folder.id)} className="text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExpanded && children.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-muted/20 flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-muted/20 z-10">
        <span className="text-sm font-semibold text-foreground">Folders</span>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={cn('w-7 h-7 rounded-full transition-all', newFolderColor === color && 'ring-2 ring-offset-2 ring-primary')}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFolderColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Folder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 p-2 space-y-0.5">
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors',
            selectedFolderId === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'
          )}
          onClick={() => onFolderSelect(null)}
        >
          <Inbox className="h-4 w-4" />
          <span className="text-sm font-medium flex-1">All Messages</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{totalCount}</span>
        </div>
        {getFolderChildren(null).map(folder => renderFolder(folder))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          {editingFolder && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={cn('w-7 h-7 rounded-full transition-all', editingFolder.color === color && 'ring-2 ring-offset-2 ring-primary')}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingFolder({ ...editingFolder, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdate} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
