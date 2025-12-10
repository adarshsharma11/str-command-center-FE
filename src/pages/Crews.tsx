import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockCrewFolders } from '@/lib/mockData';
import { ChevronRight, ChevronDown, Plus, GripVertical, FolderOpen, Folder, User } from 'lucide-react';
import { EditMemberDialog } from '@/components/crews/EditMemberDialog';
import type { CrewFolder, CrewMember } from '@/types';

export default function Crews() {
  const [folders, setFolders] = useState<CrewFolder[]>(mockCrewFolders);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder-1', 'folder-2']));
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'folder' | 'member'; id: string; parentId: string | null } | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const getFolderChildren = (parentId: string | null) => {
    return folders.filter(f => f.parentId === parentId).sort((a, b) => a.order - b.order);
  };

  const handleMemberSave = (updatedMember: CrewMember) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      members: folder.members.map(m => m.id === updatedMember.id ? updatedMember : m),
    })));
    setEditingMember(null);
  };

  const handleDragStart = (e: React.DragEvent, type: 'folder' | 'member', id: string, parentId: string | null) => {
    setDraggedItem({ type, id, parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolderId: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === 'member') {
      setFolders(prev => {
        const newFolders = prev.map(f => ({
          ...f,
          members: f.members.filter(m => m.id !== draggedItem.id),
        }));
        const sourceMember = prev.flatMap(f => f.members).find(m => m.id === draggedItem.id);
        if (!sourceMember) return prev;
        return newFolders.map(f => {
          if (f.id === targetFolderId) {
            const newMembers = [...f.members];
            newMembers.splice(targetIndex, 0, { ...sourceMember, order: targetIndex });
            return { ...f, members: newMembers.map((m, i) => ({ ...m, order: i })) };
          }
          return f;
        });
      });
    }
    setDraggedItem(null);
  };

  const renderFolder = (folder: CrewFolder, depth: number = 0) => {
    const children = getFolderChildren(folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = children.length > 0 || folder.members.length > 0;

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
          onClick={() => hasChildren && toggleFolder(folder.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, 'folder', folder.id, folder.parentId)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDropOnFolder(e, folder.id, 0)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : <div className="w-4" />}
          {isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-muted-foreground" />}
          <span className="font-medium text-foreground">{folder.name}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {folder.members.sort((a, b) => a.order - b.order).map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group"
                style={{ paddingLeft: `${(depth + 1) * 1.5 + 0.75}rem` }}
                draggable
                onDragStart={(e) => handleDragStart(e, 'member', member.id, folder.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnFolder(e, folder.id, index)}
                onClick={() => setEditingMember(member)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">{index + 1}</div>
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <div className="text-xs text-muted-foreground hidden md:block">{member.contactInfo.phone}</div>
              </div>
            ))}
            {children.map(childFolder => renderFolder(childFolder, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crew Management</h1>
            <p className="text-muted-foreground">Organize your service providers in priority order</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Category Name</Label><Input placeholder="e.g., Transportation Services" /></div>
                <div className="space-y-2"><Label>Parent Category (Optional)</Label><Input placeholder="Leave empty for root level" /></div>
                <Button className="w-full">Create Category</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Provider Hierarchy</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Drag to reorder priority. Click a contact to edit. Top members are contacted first.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">{getFolderChildren(null).map(folder => renderFolder(folder))}</div>
          </CardContent>
        </Card>
      </div>

      <EditMemberDialog member={editingMember} open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)} onSave={handleMemberSave} />
    </Layout>
  );
}
