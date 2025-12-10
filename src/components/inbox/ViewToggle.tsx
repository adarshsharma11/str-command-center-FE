import { Button } from '@/components/ui/button';
import { LayoutGrid, LayoutList } from 'lucide-react';
import type { InboxViewType } from './types';

interface ViewToggleProps {
  view: InboxViewType;
  onViewChange: (view: InboxViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={view === 'gmail' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('gmail')}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden md:inline">Gmail</span>
      </Button>
      <Button
        variant={view === 'outlook' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('outlook')}
        className="gap-2"
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden md:inline">Outlook</span>
      </Button>
    </div>
  );
}
