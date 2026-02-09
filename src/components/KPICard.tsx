import { Card, CardContent } from '@/components/ui/card';
import type { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
}

export function KPICard({ kpi, onClick }: KPICardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
