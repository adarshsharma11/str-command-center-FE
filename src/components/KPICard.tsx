import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
}

export function KPICard({ kpi, onClick }: KPICardProps) {
  const trendIcon = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-destructive" />,
    neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
  };

  const trendColor = {
    up: 'text-green-500',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-foreground">{kpi.value}</h3>
            {kpi.trend && kpi.change !== undefined && (
              <div className="flex items-center gap-1">
                {trendIcon[kpi.trend]}
                <span className={`text-sm font-medium ${trendColor[kpi.trend]}`}>
                  {Math.abs(kpi.change)}%
                </span>
              </div>
            )}
          </div>
          {kpi.changeLabel && (
            <p className="text-xs text-muted-foreground">{kpi.changeLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
