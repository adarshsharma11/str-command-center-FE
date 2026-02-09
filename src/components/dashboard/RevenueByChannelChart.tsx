import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { ChannelRevenue } from '@/lib/api/dashboard';

interface RevenueByChannelChartProps {
  data: ChannelRevenue[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Channel-specific colors for recognizable branding
const CHANNEL_COLORS: Record<string, string> = {
  'Airbnb': 'hsl(350, 85%, 55%)', // Airbnb red/pink
  'Vrbo': 'hsl(210, 90%, 50%)', // Vrbo blue
  'Direct': 'hsl(150, 70%, 45%)', // Green for direct
  'Booking.com': 'hsl(215, 80%, 45%)', // Booking.com blue
};

const chartConfig: ChartConfig = {
  revenue: {
    label: 'Revenue',
  },
};

export function RevenueByChannelChart({ data }: RevenueByChannelChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: CHANNEL_COLORS[item.channel] || COLORS[index % COLORS.length],
  }));

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="revenue"
            nameKey="channel"
            label={({ channel, percentage }) => `${channel}: ${percentage.toFixed(1)}%`}
            labelLine={{ strokeWidth: 1 }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  formatCompactCurrency(value as number),
                  name as string,
                ]}
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const item = chartData.find((d) => d.channel === value);
              return `${value} (${item?.percentage.toFixed(1) || 0}%)`;
            }}
          />
          {/* Center label showing total */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-lg font-bold"
          >
            {formatCompactCurrency(totalRevenue)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
