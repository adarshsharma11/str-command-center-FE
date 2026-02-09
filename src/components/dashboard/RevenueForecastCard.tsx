import { TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { RevenueForecastPeriod } from '@/lib/api/dashboard';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface RevenueForecastCardProps {
  forecast: RevenueForecastPeriod[];
}

const PERIOD_LABELS: Record<string, string> = {
  '30d': '30 Days',
  '60d': '60 Days',
  '90d': '90 Days',
};

export function RevenueForecastCard({ forecast }: RevenueForecastCardProps) {
  // Create sparkline data from forecast
  const sparklineData = forecast.map((item) => ({
    value: item.confirmed_revenue + item.potential_revenue,
    confirmed: item.confirmed_revenue,
  }));

  // Get the 30-day forecast for the main display
  const shortTerm = forecast.find((f) => f.period === '30d');
  const longTerm = forecast.find((f) => f.period === '90d');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Revenue Forecast
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          <Sparkles className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main 30-day figure */}
        {shortTerm && (
          <div>
            <div className="text-2xl font-bold">
              {formatCurrency(shortTerm.confirmed_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {shortTerm.bookings_count} bookings in next 30 days
            </p>
            {shortTerm.potential_revenue > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{formatCompactCurrency(shortTerm.potential_revenue)} potential
              </p>
            )}
          </div>
        )}

        {/* Mini sparkline */}
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="confirmed"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Period breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          {forecast.map((period) => (
            <div key={period.period} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                {PERIOD_LABELS[period.period]}
              </div>
              <div className="text-sm font-semibold">
                {formatCompactCurrency(period.confirmed_revenue)}
              </div>
              <div className="text-xs text-muted-foreground">
                {period.bookings_count} bookings
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
