import { User, DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/dashboardCalculations';
import type { ServiceProviderData } from '@/types/reports';
import { format, parseISO } from 'date-fns';

interface ServiceProviderPreviewProps {
  data: ServiceProviderData;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
};

export function ServiceProviderPreview({ data }: ServiceProviderPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Invoice-style Header */}
      <Card className="border-2">
        <CardHeader className="bg-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Service Provider Statement</p>
              <CardTitle className="text-2xl mt-1">{data.provider_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{data.service_type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Statement Period</p>
              <p className="font-medium">
                {format(parseISO(data.period_start), 'MMM d, yyyy')} -{' '}
                {format(parseISO(data.period_end), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">Provider Details</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-medium">{data.provider_name}</p>
                <p className="text-sm text-muted-foreground">{data.provider_email}</p>
                {data.provider_phone && (
                  <p className="text-sm text-muted-foreground">{data.provider_phone}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm">Gross Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(data.total_revenue)}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Commission ({data.commission_rate}%)</span>
                <span className="font-medium text-red-500">-{formatCurrency(data.commission_amount)}</span>
              </div>
              <div className="flex justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                <span className="font-medium">Net Payout</span>
                <span className="font-bold text-lg">{formatCurrency(data.net_payout)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Jobs</span>
            </div>
            <p className="text-2xl font-bold mt-2">{data.total_jobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Avg Job Value</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.average_job_value)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {data.jobs.filter((j) => j.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Tips Earned</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(data.jobs.reduce((sum, j) => sum + (j.tip || 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Tip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.jobs.map((job) => {
                const StatusIcon = STATUS_CONFIG[job.status].icon;
                return (
                  <TableRow key={job.job_id}>
                    <TableCell className="font-medium">
                      {format(parseISO(job.date), 'MMM d')}
                    </TableCell>
                    <TableCell>{job.property_name}</TableCell>
                    <TableCell>{job.guest_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {job.service_details}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${STATUS_CONFIG[job.status].bg} ${STATUS_CONFIG[job.status].color}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(job.amount)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {job.tip ? formatCurrency(job.tip) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (Services)</span>
              <span className="font-medium">{formatCurrency(data.total_revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tips</span>
              <span className="font-medium">
                {formatCurrency(data.jobs.reduce((sum, j) => sum + (j.tip || 0), 0))}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Total</span>
              <span className="font-medium">
                {formatCurrency(data.total_revenue + data.jobs.reduce((sum, j) => sum + (j.tip || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Platform Commission ({data.commission_rate}%)</span>
              <span>-{formatCurrency(data.commission_amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Net Payout</span>
              <span className="text-green-600">{formatCurrency(data.net_payout)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
