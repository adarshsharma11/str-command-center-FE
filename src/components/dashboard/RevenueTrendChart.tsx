import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { RevenueTrendPoint } from '@/lib/api/dashboard';
import { format, parseISO } from 'date-fns';

interface RevenueTrendChartProps {
  currentPeriod: RevenueTrendPoint[];
  lastYearPeriod: RevenueTrendPoint[];
  currentPeriodMonthly?: RevenueTrendPoint[];
  lastYearPeriodMonthly?: RevenueTrendPoint[];
}

const chartConfig: ChartConfig = {
  current: {
    label: 'This Year',
    color: 'hsl(var(--chart-1))',
  },
  lastYear: {
    label: 'Last Year',
    color: 'hsl(var(--chart-2))',
  },
};

type ViewMode = 'week' | 'month';

export function RevenueTrendChart({ currentPeriod, lastYearPeriod, currentPeriodMonthly, lastYearPeriodMonthly }: RevenueTrendChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Pick the right data source based on toggle
  const activeCurrent = viewMode === 'month' && currentPeriodMonthly?.length ? currentPeriodMonthly : currentPeriod;
  const activeLastYear = viewMode === 'month' && lastYearPeriodMonthly?.length ? lastYearPeriodMonthly : lastYearPeriod;

  // Merge data for comparison
  const chartData = activeCurrent.map((item, index) => {
    const lastYearItem = activeLastYear[index];
    return {
      date: item.date,
      label: format(parseISO(item.date), viewMode === 'week' ? 'MMM d' : 'MMM yyyy'),
      current: item.revenue,
      lastYear: lastYearItem?.revenue ?? 0,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('week')}
        >
          Weekly
        </Button>
        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('month')}
        >
          Monthly
        </Button>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lastYearGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(value)}
              className="fill-muted-foreground"
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(value, name) => [
                    formatCompactCurrency(value as number),
                    name === 'current' ? 'This Year' : 'Last Year',
                  ]}
                />
              }
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (value === 'current' ? 'This Year' : 'Last Year')}
            />
            <Area
              type="monotone"
              dataKey="lastYear"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#lastYearGradient)"
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#currentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
