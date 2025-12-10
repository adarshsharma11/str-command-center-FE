import { LayoutGrid, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { InboxViewType } from './types';

interface ViewToggleProps {
  view: InboxViewType;
  onViewChange: (view: InboxViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-3 gap-2 rounded-md',
          view === 'gmail' && 'bg-background shadow-sm'
        )}
        onClick={() => onViewChange('gmail')}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-sm font-medium">Gmail</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-3 gap-2 rounded-md',
          view === 'outlook' && 'bg-background shadow-sm'
        )}
        onClick={() => onViewChange('outlook')}
      >
        <Columns className="h-4 w-4" />
        <span className="text-sm font-medium">Outlook</span>
      </Button>
    </div>
  );
}
