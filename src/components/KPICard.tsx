import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
}

export function KPICard({ kpi, onClick }: KPICardProps) {
  const trendColor =
    kpi.trend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : kpi.trend === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
          {kpi.change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : kpi.trend === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>
                {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
              </span>
              {kpi.changeLabel && (
                <span className="text-muted-foreground font-normal">{kpi.changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
