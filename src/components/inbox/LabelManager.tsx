import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Labels</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
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
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newColor === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''
                      }`}
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
      </div>

      {/* All messages */}
      <button
        onClick={() => onLabelSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
          selectedLabelId === null ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
        }`}
      >
        All Messages
      </button>

      {/* Labels list */}
      <div className="space-y-1">
        {labels.map((label) => (
          <div
            key={label.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors ${
              selectedLabelId === label.id ? 'bg-accent' : 'hover:bg-muted/50'
            }`}
            onClick={() => onLabelSelect(label.id)}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            <span className="flex-1 text-sm truncate">{label.name}</span>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(label);
                }}
                className="p-1 hover:bg-background rounded"
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLabelDelete(label.id);
                }}
                className="p-1 hover:bg-background rounded"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newColor === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''
                    }`}
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
