import { CalendarIcon, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DateRange, DateRangePreset, UseDateRangeFilterReturn } from '@/hooks/useDateRangeFilter';

interface DashboardHeaderProps {
  dateFilter: UseDateRangeFilterReturn;
  onOpenCustomizer: () => void;
}

export function DashboardHeader({ dateFilter, onOpenCustomizer }: DashboardHeaderProps) {
  const { dateRange, preset, setPreset, setDateRange, presets } = dateFilter;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your property management performance
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Preset Selector */}
        <Select value={preset} onValueChange={(value) => setPreset(value as DateRangePreset)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, yyyy')} -{' '}
                    {format(dateRange.to, 'LLL dd, yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, yyyy')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={{ from: dateRange?.from, to: dateRange?.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Customize Dashboard Button */}
        <Button variant="outline" size="icon" onClick={onOpenCustomizer}>
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Customize dashboard</span>
        </Button>
      </div>
    </div>
  );
}
