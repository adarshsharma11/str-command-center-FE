import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { InboxLabel } from './types';

const PRESET_COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(24, 95%, 53%)',
  'hsl(45, 93%, 47%)',
  'hsl(142, 76%, 36%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(330, 80%, 60%)',
  'hsl(210, 40%, 50%)',
];

interface LabelManagerProps {
  labels: InboxLabel[];
  onLabelCreate: (label: Omit<InboxLabel, 'id'>) => void;
  onLabelUpdate: (label: InboxLabel) => void;
  onLabelDelete: (labelId: string) => void;
  selectedLabelId: string | null;
  onLabelSelect: (labelId: string | null) => void;
}

export function LabelManager({
  labels,
  onLabelCreate,
  onLabelUpdate,
  onLabelDelete,
  selectedLabelId,
  onLabelSelect,
}: LabelManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<InboxLabel | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onLabelCreate({ name: newName, color: newColor });
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setIsCreateOpen(false);
  };

  const handleUpdate = () => {
    if (!editingLabel || !newName.trim()) return;
    onLabelUpdate({ ...editingLabel, name: newName, color: newColor });
    setEditingLabel(null);
    setNewName('');
  };

  const openEdit = (label: InboxLabel) => {
    setEditingLabel(label);
    setNewName(label.name);
    setNewColor(label.color);
  };

  return (
    <div className="p-4 space-y-2">
      {/* All messages */}
      <button
        onClick={() => onLabelSelect(null)}
        className={cn(
          'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
          selectedLabelId === null
            ? 'bg-accent text-accent-foreground'
            : 'text-foreground hover:bg-muted/50'
        )}
      >
        <Tag className="h-4 w-4" />
        All Messages
      </button>

      {/* Labels list */}
      <div className="space-y-1 pt-2">
        {labels.map((label) => (
          <div
            key={label.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer group transition-colors',
              selectedLabelId === label.id ? 'bg-accent' : 'hover:bg-muted/50'
            )}
            onClick={() => onLabelSelect(label.id)}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            <span className="flex-1 text-sm font-medium truncate">{label.name}</span>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(label);
                }}
                className="p-1.5 hover:bg-background rounded-md transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLabelDelete(label.id);
                }}
                className="p-1.5 hover:bg-background rounded-md transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create label button */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-3 mt-4 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
            Create Label
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      newColor === color && 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full">
              Create Label
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingLabel} onOpenChange={(open) => !open && setEditingLabel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      newColor === color && 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
