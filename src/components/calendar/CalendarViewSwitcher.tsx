import { Button } from '@/components/ui/button';
import { CalendarView } from './types';
import { cn } from '@/lib/utils';

interface CalendarViewSwitcherProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const views: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export function CalendarViewSwitcher({ currentView, onViewChange }: CalendarViewSwitcherProps) {
  return (
    <div className="flex bg-muted rounded-lg p-1 gap-1">
      {views.map((view) => (
        <Button
          key={view.value}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(view.value)}
          className={cn(
            'px-4 py-1.5 text-sm font-medium transition-all duration-200',
            currentView === view.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
}
