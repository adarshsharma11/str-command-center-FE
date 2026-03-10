import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth, subDays, subMonths, startOfYear, format, isValid, parseISO } from 'date-fns';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'thisYear'
  | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface UseDateRangeFilterOptions {
  defaultPreset?: DateRangePreset;
  defaultRange?: DateRange;
}

export interface UseDateRangeFilterReturn {
  dateRange: DateRange;
  preset: DateRangePreset;
  setDateRange: (range: DateRange) => void;
  setPreset: (preset: DateRangePreset) => void;
  formattedRange: string;
  apiParams: { from: string; to: string };
  presets: { value: DateRangePreset; label: string }[];
}

const presetOptions: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

function getPresetRange(preset: DateRangePreset): DateRange {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { from: startOfToday, to: today };
    case 'yesterday': {
      const yesterday = subDays(startOfToday, 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { from: yesterday, to: yesterdayEnd };
    }
    case 'last7days':
      return { from: subDays(startOfToday, 6), to: today };
    case 'last30days':
      return { from: subDays(startOfToday, 29), to: today };
    case 'thisMonth':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'lastMonth': {
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case 'last3Months':
      return { from: subMonths(startOfToday, 3), to: today };
    case 'last6Months':
      return { from: subMonths(startOfToday, 6), to: today };
    case 'thisYear':
      return { from: startOfYear(today), to: today };
    case 'custom':
    default:
      return { from: subDays(startOfToday, 29), to: today };
  }
}

export function useDateRangeFilter(options: UseDateRangeFilterOptions = {}): UseDateRangeFilterReturn {
  const { defaultPreset = 'thisMonth', defaultRange } = options;

  const [preset, setPresetState] = useState<DateRangePreset>(defaultPreset);
  const [dateRange, setDateRangeState] = useState<DateRange>(() => {
    if (defaultRange && isValid(defaultRange.from) && isValid(defaultRange.to)) {
      return defaultRange;
    }
    return getPresetRange(defaultPreset);
  });

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setPresetState(newPreset);
    if (newPreset !== 'custom') {
      setDateRangeState(getPresetRange(newPreset));
    }
  }, []);

  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range);
    setPresetState('custom');
  }, []);

  const formattedRange = useMemo(() => {
    const fromStr = format(dateRange.from, 'MMM d, yyyy');
    const toStr = format(dateRange.to, 'MMM d, yyyy');
    if (fromStr === toStr) return fromStr;
    return `${fromStr} - ${toStr}`;
  }, [dateRange]);

  const apiParams = useMemo(() => ({
    from: format(dateRange.from, 'yyyy-MM-dd'),
    to: format(dateRange.to, 'yyyy-MM-dd'),
  }), [dateRange]);

  return {
    dateRange,
    preset,
    setDateRange,
    setPreset,
    formattedRange,
    apiParams,
    presets: presetOptions,
  };
}

// Utility function to parse date strings from URL params
export function parseDateRangeFromParams(from: string | null, to: string | null): DateRange | null {
  if (!from || !to) return null;

  const fromDate = parseISO(from);
  const toDate = parseISO(to);

  if (!isValid(fromDate) || !isValid(toDate)) return null;

  return { from: fromDate, to: toDate };
}
