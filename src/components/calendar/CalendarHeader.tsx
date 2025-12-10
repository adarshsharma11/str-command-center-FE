import { format, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarViewSwitcher } from './CalendarViewSwitcher';
import { ColorPickerSettings } from './ColorPickerSettings';
import { CalendarView, ColorAssignment } from './types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  currentView: CalendarView;
  colorAssignments: ColorAssignment[];
  selectedProperty: string;
  properties: { id: string; name: string }[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onColorAssignmentsChange: (assignments: ColorAssignment[]) => void;
  onPropertyChange: (propertyId: string) => void;
  onAddEvent: () => void;
}

export function CalendarHeader({
  currentDate,
  currentView,
  colorAssignments,
  selectedProperty,
  properties,
  onDateChange,
  onViewChange,
  onColorAssignmentsChange,
  onPropertyChange,
  onAddEvent,
}: CalendarHeaderProps) {
  const navigatePrev = () => {
    switch (currentView) {
      case 'day':
        onDateChange(subDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(subMonths(currentDate, 1));
        break;
      case 'year':
        onDateChange(subYears(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (currentView) {
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
      case 'year':
        onDateChange(addYears(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return format(currentDate, "'Week of' MMMM d, yyyy");
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
    }
  };

  // Mock data for color picker
  const channels = [
    { id: 'airbnb', name: 'Airbnb' },
    { id: 'vrbo', name: 'Vrbo' },
    { id: 'direct', name: 'Direct' },
    { id: 'booking', name: 'Booking.com' },
  ];

  const crews = [
    { id: 'c1', name: 'Maria Santos' },
    { id: 'c2', name: 'Carlos Rodriguez' },
    { id: 'c3', name: 'Chef Antoine' },
  ];

  const taskTypes = [
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'chef', name: 'Private Chef' },
    { id: 'bartender', name: 'Bartender' },
    { id: 'massage', name: 'Massage' },
    { id: 'handyman', name: 'Handyman' },
    { id: 'concierge', name: 'Concierge' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border-b border-border">
      {/* Top Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrev}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight size={18} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="gap-2">
              <CalendarIcon size={14} />
              Today
            </Button>
          </div>

          {/* Date Label */}
          <h2 className="text-lg font-semibold text-foreground">
            {getDateLabel()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <CalendarViewSwitcher
            currentView={currentView}
            onViewChange={onViewChange}
          />
        </div>
      </div>

      {/* Bottom Row - Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Property Filter */}
          <Select value={selectedProperty} onValueChange={onPropertyChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Color Settings */}
          <ColorPickerSettings
            assignments={colorAssignments}
            onUpdate={onColorAssignmentsChange}
            properties={properties}
            channels={channels}
            crews={crews}
            taskTypes={taskTypes}
          />
        </div>

        {/* Add Event Button */}
        <Button onClick={onAddEvent} className="gap-2">
          <Plus size={16} />
          Add Event
        </Button>
      </div>
    </div>
  );
}
