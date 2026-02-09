import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/dashboardCalculations';
import type { PaymentCollection } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

interface PaymentStatusCardProps {
  payments: PaymentCollection;
}

export function PaymentStatusCard({ payments }: PaymentStatusCardProps) {
  const { paid, partial, pending, total } = payments;

  const paidPercentage = total > 0 ? (paid / total) * 100 : 0;
  const partialPercentage = total > 0 ? (partial / total) * 100 : 0;
  const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;

  const statusItems = [
    {
      label: 'Paid',
      amount: paid,
      percentage: paidPercentage,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
    },
    {
      label: 'Partial',
      amount: partial,
      percentage: partialPercentage,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
    },
    {
      label: 'Pending',
      amount: pending,
      percentage: pendingPercentage,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Payment Collection
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          Total: {formatCompactCurrency(total)}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked progress bar */}
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${paidPercentage}%` }}
          />
          <div
            className="bg-yellow-500 h-full transition-all"
            style={{ width: `${partialPercentage}%` }}
          />
          <div
            className="bg-red-500 h-full transition-all"
            style={{ width: `${pendingPercentage}%` }}
          />
        </div>

        {/* Status breakdown */}
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className={cn('h-4 w-4', item.color)} />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatCompactCurrency(item.amount)}
                </span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Collection rate */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Collection Rate</span>
            <span className="text-sm font-semibold text-green-600">
              {paidPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
