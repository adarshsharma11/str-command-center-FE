import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { PropertyOccupancy } from '@/lib/api/dashboard';

interface OccupancyChartProps {
  data: PropertyOccupancy[];
}

const chartConfig: ChartConfig = {
  occupancy: {
    label: 'Occupancy Rate',
    color: 'hsl(var(--chart-1))',
  },
};

// Color scale based on occupancy rate
function getOccupancyColor(rate: number): string {
  if (rate >= 80) return 'hsl(var(--chart-1))'; // Green-ish
  if (rate >= 60) return 'hsl(var(--chart-3))'; // Yellow-ish
  return 'hsl(var(--chart-5))'; // Red-ish
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  // Sort by occupancy rate descending
  const sortedData = [...data].sort((a, b) => b.occupancy_rate - a.occupancy_rate);

  // Truncate property names for display
  const chartData = sortedData.map((item) => ({
    ...item,
    displayName: item.property_name.length > 20
      ? item.property_name.substring(0, 18) + '...'
      : item.property_name,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            className="fill-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="displayName"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={120}
            className="fill-muted-foreground"
          />
          <Tooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.property_name || '';
                }}
                formatter={(value) => [`${value}%`, 'Occupancy']}
              />
            }
          />
          <Bar
            dataKey="occupancy_rate"
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getOccupancyColor(entry.occupancy_rate)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
