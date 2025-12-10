import { useState } from 'react';
import { ColorAssignment, ColorCategory, colorPresets } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Palette, Home, Radio, Users, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerSettingsProps {
  assignments: ColorAssignment[];
  onUpdate: (assignments: ColorAssignment[]) => void;
  properties: { id: string; name: string }[];
  channels: { id: string; name: string }[];
  crews: { id: string; name: string }[];
  taskTypes: { id: string; name: string }[];
}

const categoryIcons: Record<ColorCategory, React.ElementType> = {
  property: Home,
  channel: Radio,
  crew: Users,
  taskType: ClipboardList,
};

const categoryLabels: Record<ColorCategory, string> = {
  property: 'Properties',
  channel: 'Channels',
  crew: 'Crews',
  taskType: 'Task Types',
};

function ColorPicker({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (color: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {colorPresets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'w-7 h-7 rounded-full transition-all duration-200',
              'hover:scale-110 hover:shadow-md',
              value === color && 'ring-2 ring-offset-2 ring-primary'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 p-0 border-0"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function CategoryColorList({
  category,
  items,
  assignments,
  onUpdate,
}: {
  category: ColorCategory;
  items: { id: string; name: string }[];
  assignments: ColorAssignment[];
  onUpdate: (assignments: ColorAssignment[]) => void;
}) {
  const getColor = (id: string) => {
    const assignment = assignments.find(
      (a) => a.category === category && a.id === id
    );
    return assignment?.color || '#6B7280';
  };

  const updateColor = (id: string, name: string, color: string) => {
    const existing = assignments.find(
      (a) => a.category === category && a.id === id
    );
    
    if (existing) {
      onUpdate(
        assignments.map((a) =>
          a.category === category && a.id === id
            ? { ...a, color }
            : a
        )
      );
    } else {
      onUpdate([...assignments, { id, category, name, color }]);
    }
  };

  return (
    <ScrollArea className="h-64">
      <div className="space-y-4 pr-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getColor(item.id) }}
              />
              <Label className="text-sm font-medium">{item.name}</Label>
            </div>
            <ColorPicker
              value={getColor(item.id)}
              onChange={(color) => updateColor(item.id, item.name, color)}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function ColorPickerSettings({
  assignments,
  onUpdate,
  properties,
  channels,
  crews,
  taskTypes,
}: ColorPickerSettingsProps) {
  const [open, setOpen] = useState(false);

  const categoryItems: Record<ColorCategory, { id: string; name: string }[]> = {
    property: properties,
    channel: channels,
    crew: crews,
    taskType: taskTypes,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette size={16} />
          Colors
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Color Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="property" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            {(Object.keys(categoryIcons) as ColorCategory[]).map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <TabsTrigger key={cat} value={cat} className="gap-1.5">
                  <Icon size={14} />
                  <span className="hidden sm:inline">{categoryLabels[cat]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(categoryIcons) as ColorCategory[]).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <CategoryColorList
                category={cat}
                items={categoryItems[cat]}
                assignments={assignments}
                onUpdate={onUpdate}
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
