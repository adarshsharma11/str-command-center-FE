import { useState } from 'react';
import { ArrowLeft, CalendarIcon, Download, Mail, Clock, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { downloadReportPDF } from '@/lib/utils/pdfDownload';
import type { ReportType, ReportFilters as ReportFiltersType } from '@/types/reports';
import type { UseDateRangeFilterReturn, DateRangePreset } from '@/hooks/useDateRangeFilter';

interface ReportFiltersProps {
  reportType: ReportType;
  dateFilter: UseDateRangeFilterReturn;
  selectedPropertyIds: string[];
  setSelectedPropertyIds: (ids: string[]) => void;
  selectedOwnerIds: string[];
  setSelectedOwnerIds: (ids: string[]) => void;
  onBack: () => void;
  onSchedule: () => void;
  onEmail: () => void;
  filters: ReportFiltersType;
}

// TODO: [ADARSH] Replace with actual API call to fetch properties
const MOCK_PROPERTIES = [
  { id: '1', name: 'Ocean View Villa' },
  { id: '2', name: 'Mountain Retreat' },
  { id: '3', name: 'Downtown Loft' },
  { id: '4', name: 'Beachfront Condo' },
  { id: '5', name: 'Lakeside Cabin' },
];

// TODO: [ADARSH] Replace with actual API call to fetch owners
const MOCK_OWNERS = [
  { id: 'owner-1', name: 'Robert Williams' },
  { id: 'owner-2', name: 'Sarah Johnson' },
  { id: 'owner-3', name: 'Michael Chen' },
];

const REPORT_TITLES: Record<ReportType, string> = {
  'owner-statement': 'Owner Statement',
  'booking-summary': 'Booking Summary',
  'service-revenue': 'Service Revenue',
  'service-provider': 'Service Provider Statement',
  'occupancy': 'Occupancy Report',
  'performance': 'Performance Comparison',
};

export function ReportFilters({
  reportType,
  dateFilter,
  selectedPropertyIds,
  setSelectedPropertyIds,
  selectedOwnerIds,
  setSelectedOwnerIds,
  onBack,
  onSchedule,
  onEmail,
  filters,
}: ReportFiltersProps) {
  const { dateRange, preset, setPreset, setDateRange, presets } = dateFilter;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadReportPDF(reportType, filters);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleProperty = (id: string) => {
    if (selectedPropertyIds.includes(id)) {
      setSelectedPropertyIds(selectedPropertyIds.filter((p) => p !== id));
    } else {
      setSelectedPropertyIds([...selectedPropertyIds, id]);
    }
  };

  const toggleOwner = (id: string) => {
    if (selectedOwnerIds.includes(id)) {
      setSelectedOwnerIds(selectedOwnerIds.filter((o) => o !== id));
    } else {
      setSelectedOwnerIds([...selectedOwnerIds, id]);
    }
  };

  const showPropertyFilter = ['owner-statement', 'booking-summary', 'occupancy'].includes(reportType);
  const showOwnerFilter = reportType === 'owner-statement';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-lg">{REPORT_TITLES[reportType]}</CardTitle>
              <p className="text-sm text-muted-foreground">Configure report parameters</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSchedule}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" onClick={onEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="flex flex-wrap items-end gap-3">
          <Select value={preset} onValueChange={(v) => setPreset(v as DateRangePreset)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-9 px-3 justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Select dates</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
        </div>

        {/* Property Filter */}
        {showPropertyFilter && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Properties</Label>
              {selectedPropertyIds.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedPropertyIds.length} selected
                </Badge>
              )}
              {selectedPropertyIds.length === 0 && (
                <span className="text-xs text-muted-foreground">All properties</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_PROPERTIES.map((property) => (
                <label
                  key={property.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors',
                    selectedPropertyIds.includes(property.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  )}
                >
                  <Checkbox
                    checked={selectedPropertyIds.includes(property.id)}
                    onCheckedChange={() => toggleProperty(property.id)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-sm">{property.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Owner Filter */}
        {showOwnerFilter && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Property Owners</Label>
              {selectedOwnerIds.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedOwnerIds.length} selected
                </Badge>
              )}
              {selectedOwnerIds.length === 0 && (
                <span className="text-xs text-muted-foreground">All owners</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_OWNERS.map((owner) => (
                <label
                  key={owner.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors',
                    selectedOwnerIds.includes(owner.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  )}
                >
                  <Checkbox
                    checked={selectedOwnerIds.includes(owner.id)}
                    onCheckedChange={() => toggleOwner(owner.id)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-sm">{owner.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
