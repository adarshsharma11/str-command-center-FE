// Dashboard calculation utilities

/**
 * Calculate Average Daily Rate (ADR)
 * ADR = Total Revenue / Total Nights Booked
 */
export function calculateADR(totalRevenue: number, totalNights: number): number {
  if (totalNights === 0) return 0;
  return Math.round(totalRevenue / totalNights);
}

/**
 * Calculate Occupancy Rate
 * Occupancy Rate = (Booked Nights / Available Nights) * 100
 */
export function calculateOccupancyRate(bookedNights: number, availableNights: number): number {
  if (availableNights === 0) return 0;
  return Math.round((bookedNights / availableNights) * 100 * 10) / 10; // One decimal place
}

/**
 * Calculate Revenue Per Available Night (RevPAN)
 * RevPAN = Total Revenue / Available Nights
 */
export function calculateRevPAN(totalRevenue: number, availableNights: number): number {
  if (availableNights === 0) return 0;
  return Math.round(totalRevenue / availableNights);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100; // Infinite growth, cap at 100%
  }
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * Determine trend direction based on change
 */
export function getTrend(change: number): 'up' | 'down' | 'neutral' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format compact currency (e.g., $12.5K)
 */
export function formatCompactCurrency(value: number, currency = 'USD'): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(value, currency);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Get period comparison dates
 */
export function getComparisonPeriod(
  start: Date,
  end: Date
): { previousStart: Date; previousEnd: Date } {
  const days = daysBetween(start, end);
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - days);

  return { previousStart, previousEnd };
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Calculate channel percentage distribution
 */
export function calculateChannelDistribution(
  channels: { channel: string; revenue: number }[]
): { channel: string; revenue: number; percentage: number }[] {
  const total = channels.reduce((sum, c) => sum + c.revenue, 0);
  if (total === 0) return channels.map(c => ({ ...c, percentage: 0 }));

  return channels.map(c => ({
    ...c,
    percentage: Math.round((c.revenue / total) * 100 * 10) / 10,
  }));
}

/**
 * Group revenue data by week
 */
export function groupByWeek(
  data: { date: string; revenue: number }[]
): { week: string; revenue: number }[] {
  const weeks: Record<string, number> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    weeks[weekKey] = (weeks[weekKey] || 0) + item.revenue;
  });

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, revenue]) => ({ week, revenue }));
}

/**
 * Group revenue data by month
 */
export function groupByMonth(
  data: { date: string; revenue: number }[]
): { month: string; revenue: number }[] {
  const months: Record<string, number> = {};

  data.forEach(item => {
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    months[monthKey] = (months[monthKey] || 0) + item.revenue;
  });

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}

/**
 * Calculate sparkline data points (normalized 0-100)
 */
export function normalizeForSparkline(values: number[]): number[] {
  if (values.length === 0) return [];

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 50);

  return values.map(v => Math.round(((v - min) / range) * 100));
}
